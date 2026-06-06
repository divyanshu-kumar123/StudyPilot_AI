const { Router } = require('express');
const { generateQuiz, generateFlashcards, generateNotes, generateKnowledgeGraph, getKnowledgeGraph } = require('../controllers/study.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

// All study material generation requires authentication
router.use(verifyJWT);

// Document specific generations
router.post('/:documentId/quiz', generateQuiz);
router.post('/:documentId/flashcards', generateFlashcards);
router.post('/:documentId/notes', generateNotes);

// Knowledge Graph Endpoints
router.post('/:documentId/graph', generateKnowledgeGraph);
router.get('/:documentId/graph', getKnowledgeGraph);

module.exports = router;