const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    embeddingId: { type: String, required: true }, // Maps to Pinecone vector ID
    topic: { type: String },
    pageNumber: { type: Number }
}, {
    timestamps: true
});

// Indexes for fast retrieval
chunkSchema.index({ documentId: 1 });
chunkSchema.index({ userId: 1 });
chunkSchema.index({ embeddingId: 1 });
chunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true }); // Compound unique index

const Chunk = mongoose.model('Chunk', chunkSchema);
module.exports = Chunk;