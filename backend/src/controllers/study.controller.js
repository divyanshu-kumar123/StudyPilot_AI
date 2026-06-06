const Document = require("../models/document.model");
const Chunk = require("../models/chunk.model");
const Quiz = require("../models/quiz.model");
const watsonxService = require("../services/watsonx.service");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");
const KnowledgeGraph = require("../models/knowledgeGraph.model");

// Helper to retrieve document context safely
const getDocumentContext = async (documentId, userId, limit = 10) => {
  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    throw new ApiError(404, "Document not found or unauthorized access");
  }
  if (document.processingStatus !== "completed") {
    throw new ApiError(400, "Document is still processing. Please wait.");
  }

  // Retrieve chunks to build our context window.
  // We limit to 10 chunks (~8000 chars) to prevent blowing out the LLM context window.
  const chunks = await Chunk.find({ documentId }).limit(limit);
  const contextText = chunks.map((c) => c.content).join("\n\n");

  return { document, contextText };
};

exports.generateQuiz = catchAsync(async (req, res) => {
  const { documentId } = req.params;
  const {
    difficulty = "intermediate",
    totalQuestions = 5,
    quizType = "mcq",
  } = req.body;
  const userId = req.user._id;

  // 1. Fetch Context
  const { document, contextText } = await getDocumentContext(
    documentId,
    userId,
  );

  if (!contextText) {
    throw new ApiError(
      400,
      "Not enough text extracted from document to generate a quiz.",
    );
  }

  // 2. Construct the strict JSON prompt for Watsonx
  const prompt = `
    You are an expert educational AI. Based strictly on the provided document context, generate a ${difficulty} level quiz with ${totalQuestions} questions of type ${quizType}.
    
    Document Context:
    """
    ${contextText}
    """

    You MUST respond with ONLY valid JSON. Do not include markdown formatting like \`\`\`json. Do not include any conversational text. 
    The JSON structure MUST match this exact schema:
    {
        "title": "A descriptive title for the quiz",
        "questions": [
            {
                "questionText": "The question here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Option B",
                "explanation": "Brief explanation of why Option B is correct based on the text."
            }
        ]
    }
        Return ONLY valid JSON.
            Do not include:
            - markdown
            - explanations
            - notes
            - code fences
            - text before JSON
            - text after JSON

            Your response must begin with {
            and end with }
    `;

  console.log(
    `[AI] Requesting Quiz generation from Watsonx for Document: ${documentId}...`,
  );

  // 3. Call Watsonx
  const generatedText = await watsonxService.generateText(prompt);

  // 4. Parse the AI Response safely
  let parsedData;
  try {
    // Find the absolute first and last braces to extract just the JSON object
    const firstBrace = generatedText.indexOf("{");
    const lastBrace = generatedText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON boundaries found in AI response");
    }

    const jsonString = generatedText.substring(firstBrace, lastBrace + 1);
    parsedData = JSON.parse(jsonString);
  } catch (error) {
    console.error(
      "[AI] Failed to parse Watsonx JSON output. Raw Output:",
      generatedText,
    );
    throw new ApiError(
      500,
      "AI generated invalid data format. Please try again.",
    );
  }

  // 5. Save to Database
  const quiz = await Quiz.create({
    userId,
    documentId,
    title: parsedData.title || `${document.title} - Practice Quiz`,
    quizType,
    difficulty,
    totalQuestions: parsedData.questions.length,
    estimatedTime: parsedData.questions.length * 1.5, // estimate 1.5 mins per question
    questions: parsedData.questions,
  });

  // 6. Return Success
  res
    .status(201)
    .json(new ApiResponse(201, quiz, "Quiz generated successfully"));
});

exports.generateFlashcards = catchAsync(async (req, res) => {
  const { documentId } = req.params;
  const { difficulty = "medium", count = 10 } = req.body;
  const userId = req.user._id;

  const { document, contextText } = await getDocumentContext(
    documentId,
    userId,
  );

  if (!contextText)
    throw new ApiError(400, "Not enough text extracted from document.");

  const prompt = `
    You are an expert tutor. Based strictly on the provided document context, generate ${count} flashcards at a ${difficulty} difficulty level.
    
    Document Context:
    """
    ${contextText}
    """

    You MUST respond with ONLY valid JSON. The JSON structure MUST match this exact schema:
    {
        "flashcards": [
            {
                "question": "Concept question here?",
                "answer": "Concise answer here.",
                "topic": "Main topic keyword"
            }
        ]
    }
    `;

  console.log(`[AI] Requesting Flashcards for Document: ${documentId}...`);
  const generatedText = await watsonxService.generateText(prompt);

  let parsedData;
  try {
    const firstBrace = generatedText.indexOf("{");
    const lastBrace = generatedText.lastIndexOf("}");
    parsedData = JSON.parse(generatedText.substring(firstBrace, lastBrace + 1));
  } catch (error) {
    throw new ApiError(
      500,
      "AI generated invalid data format. Please try again.",
    );
  }

  // Save each flashcard to the database
  const Flashcard = require("../models/flashcard.model");
  const flashcardsToInsert = parsedData.flashcards.map((fc) => ({
    userId,
    documentId,
    question: fc.question,
    answer: fc.answer,
    topic: fc.topic,
    difficulty,
    generatedByAI: true,
  }));

  const savedFlashcards = await Flashcard.insertMany(flashcardsToInsert);

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        savedFlashcards,
        "Flashcards generated successfully",
      ),
    );
});

exports.generateNotes = catchAsync(async (req, res) => {
  const { documentId } = req.params;
  const { noteType = "summary" } = req.body; // 'summary', 'detailed', or 'key_points'
  const userId = req.user._id;

  const { document, contextText } = await getDocumentContext(
    documentId,
    userId,
  );

  if (!contextText)
    throw new ApiError(400, "Not enough text extracted from document.");

  const prompt = `
    You are an expert note-taker. Based strictly on the provided document context, generate ${noteType} notes.
    
    Document Context:
    """
    ${contextText}
    """

    You MUST respond with ONLY valid JSON. The content field should contain well-formatted HTML (using <h2>, <ul>, <li>, <p>, <strong> tags) suitable for a rich text editor.
    The JSON structure MUST match this schema:
    {
        "title": "A descriptive title for these notes",
        "content": "<h1>Main Title</h1><p>Notes go here...</p>",
        "tags": ["tag1", "tag2"]
    }
    `;

  console.log(`[AI] Requesting Notes for Document: ${documentId}...`);
  const generatedText = await watsonxService.generateText(prompt);

  let parsedData;
  try {
    const firstBrace = generatedText.indexOf("{");
    const lastBrace = generatedText.lastIndexOf("}");
    parsedData = JSON.parse(generatedText.substring(firstBrace, lastBrace + 1));
  } catch (error) {
    throw new ApiError(
      500,
      "AI generated invalid data format. Please try again.",
    );
  }

  const Notes = require("../models/notes.model");
  const notes = await Notes.create({
    userId,
    documentId,
    title: parsedData.title,
    noteType,
    content: parsedData.content,
    tags: parsedData.tags,
    generatedByAI: true,
  });

  res
    .status(201)
    .json(new ApiResponse(201, notes, "Notes generated successfully"));
});

exports.generateKnowledgeGraph = catchAsync(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user._id;

  // Use our existing helper to check rights and grab text chunks
  const { document, contextText } = await getDocumentContext(
    documentId,
    userId,
  );

  if (!contextText) {
    throw new ApiError(
      400,
      "Not enough text extracted from document to construct a graph.",
    );
  }

  // Direct Watsonx to parse terms, concepts, and relationships as an architectural layout
  const prompt = `
    You are an advanced data architect. Analyze the provided text context and build a structured knowledge graph map of the concepts, terms, and formulas contained within.
    
    Context:
    """
    ${contextText}
    """

    Identify the core concepts as nodes, and identify how they connect or relate to each other as edges.
    You MUST respond with ONLY a valid JSON object. Do not wrap it in conversational text.
    
    The JSON structure MUST match this exact schema:
    {
        "nodes": [
            { "id": "n1", "label": "Main Concept Name", "type": "concept" },
            { "id": "n2", "label": "Sub Term Name", "type": "term" }
        ],
        "edges": [
            { "source": "n1", "target": "n2", "relationship": "contains" }
        ]
    }
    `;

  console.log(
    `[AI] Generating Knowledge Graph from Watsonx for Document: ${documentId}...`,
  );
  const generatedText = await watsonxService.generateText(prompt);

  // Hardened JSON boundary boundaries extraction
  let parsedData;
  try {
    const firstBrace = generatedText.indexOf("{");
    const lastBrace = generatedText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON boundaries found");
    }
    parsedData = JSON.parse(generatedText.substring(firstBrace, lastBrace + 1));
  } catch (error) {
    console.error("[AI] Knowledge Graph JSON parse failed:", generatedText);
    throw new ApiError(
      500,
      "AI generated invalid structural layout data. Please try again.",
    );
  }

  // Save or replace graph layout (Upsert pattern per document)
  const graph = await KnowledgeGraph.findOneAndUpdate(
    { documentId },
    {
      documentId,
      nodes: parsedData.nodes,
      edges: parsedData.edges,
      generatedAt: new Date(),
    },
    { new: true, upsert: true },
  );

  res
    .status(201)
    .json(
      new ApiResponse(201, graph, "Knowledge graph map generated successfully"),
    );
});

exports.getKnowledgeGraph = catchAsync(async (req, res) => {
  const { documentId } = req.params;
  const userId = req.user._id;

  // Fast-path security check: Ensure document belongs to requesting user
  const document = await Document.findOne({ _id: documentId, userId });
  if (!document) {
    throw new ApiError(404, "Document record not found or unauthorized access");
  }

  const graph = await KnowledgeGraph.findOne({ documentId });
  if (!graph) {
    throw new ApiError(
      404,
      "No knowledge graph found for this document. Please generate it first.",
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, graph, "Knowledge graph retrieved successfully"),
    );
});
