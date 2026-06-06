const { Worker } = require("bullmq");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const redisConnection = require("../config/redis");
const Document = require("../models/document.model");
const Chunk = require("../models/chunk.model");
const {
  generateEmbedding,
  getEmbeddingPipeline,
} = require("../services/embedding.service");
const { getPineconeIndex } = require("../config/pinecone");

// Helper to chunk text intelligently (roughly 500-1000 characters per chunk)
const chunkText = (text, maxLength = 800) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let chunks = [];
  let currentChunk = "";

  for (let sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
};

// Initialize the model eagerly when the worker file is loaded
getEmbeddingPipeline();

const worker = new Worker(
  "pdf-processing-queue",
  async (job) => {
    const { documentId, fileUrl, userId } = job.data;
    console.log(`[Worker] Starting job ${job.id} for document: ${documentId}`);

    try {
      // 1. Update status to 'processing'
      await Document.findByIdAndUpdate(documentId, {
        processingStatus: "processing",
        processingStartedAt: new Date(),
      });

      // 2. Download PDF Buffer from Cloudinary
      const response = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });
      const pdfBuffer = Buffer.from(response.data, "binary");

      // 3. Extract Text using pdf-parse
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text;
      const totalPages = pdfData.numpages;

      // 4. Chunk the text
      const textChunks = chunkText(extractedText);
      const pineconeIndex = getPineconeIndex();

      let chunkDocs = [];
      let pineconeVectors = [];

      // 5. Generate Embeddings & Prepare for DBs
      for (let i = 0; i < textChunks.length; i++) {
        const content = textChunks[i];
        const embeddingId = `doc_${documentId}_chunk_${i}`;

        // Generate local embedding
        const vector = await generateEmbedding(content);

        pineconeVectors.push({
          id: embeddingId,
          values: Array.from(vector),
          metadata: {
            documentId: documentId.toString(),
            userId: userId.toString(),
            chunkIndex: i,
          },
        });

        chunkDocs.push({
          documentId,
          userId,
          chunkIndex: i,
          content,
          embeddingId,
          pageNumber: 1, // Simplified for now; pdf-parse extracts all text at once
        });
      }

      // 6. Batch Upsert to Pinecone
      if (pineconeVectors.length > 0) {
        await pineconeIndex.upsert({
          records: pineconeVectors,
        });
      }

      // 7. Batch Insert to MongoDB
      if (chunkDocs.length > 0) {
        await Chunk.insertMany(chunkDocs);
      }

      // 8. Mark Document as Completed
      await Document.findByIdAndUpdate(documentId, {
        processingStatus: "completed",
        extractedText: extractedText.substring(0, 5000), // Store preview to avoid MongoDB BSON limits
        totalPages,
        processingCompletedAt: new Date(),
      });

      console.log(`[Worker] Job ${job.id} completed successfully!`);
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error);
      await Document.findByIdAndUpdate(documentId, {
        processingStatus: "failed",
      });
      throw error; // Let BullMQ handle the retry logic
    }
  },
  { connection: redisConnection },
);

worker.on("failed", (job, err) => {
  console.error(`[BullMQ] Job ${job.id} has failed with ${err.message}`);
});

module.exports = worker;
