const Document = require('../models/document.model');
const Chunk = require('../models/chunk.model');
const Quiz = require('../models/quiz.model');
const watsonxService = require('../services/watsonx.service');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

// Helper to retrieve document context safely
const getDocumentContext = async (documentId, userId, limit = 10) => {
    const document = await Document.findOne({ _id: documentId, userId });
    
    if (!document) {
        throw new ApiError(404, 'Document not found or unauthorized access');
    }
    if (document.processingStatus !== 'completed') {
        throw new ApiError(400, 'Document is still processing. Please wait.');
    }

    // Retrieve chunks to build our context window. 
    // We limit to 10 chunks (~8000 chars) to prevent blowing out the LLM context window.
    const chunks = await Chunk.find({ documentId }).limit(limit);
    const contextText = chunks.map(c => c.content).join('\n\n');
    
    return { document, contextText };
};

exports.generateQuiz = catchAsync(async (req, res) => {
    const { documentId } = req.params;
    const { difficulty = 'intermediate', totalQuestions = 5, quizType = 'mcq' } = req.body;
    const userId = req.user._id;

    // 1. Fetch Context
    const { document, contextText } = await getDocumentContext(documentId, userId);

    if (!contextText) {
        throw new ApiError(400, 'Not enough text extracted from document to generate a quiz.');
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
    `;

    console.log(`[AI] Requesting Quiz generation from Watsonx for Document: ${documentId}...`);

    // 3. Call Watsonx
    const generatedText = await watsonxService.generateText(prompt);

    // 4. Parse the AI Response safely
    let parsedData;
    try {
        // Strip out any accidental markdown blocks the LLM might hallucinate
        const cleanJsonString = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanJsonString);
    } catch (error) {
        console.error('[AI] Failed to parse Watsonx JSON output:', generatedText);
        throw new ApiError(500, 'AI generated invalid data. Please try again.');
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
        questions: parsedData.questions
    });

    // 6. Return Success
    res.status(201).json(
        new ApiResponse(201, quiz, 'Quiz generated successfully')
    );
});