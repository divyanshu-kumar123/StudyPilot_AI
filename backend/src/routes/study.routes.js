const { Router } = require('express');
const { generateQuiz, generateFlashcards, generateNotes, generateKnowledgeGraph, getKnowledgeGraph, getSavedQuizzes, getSavedNotes, getSavedFlashcards, getAllUserQuizzes, getAllUserFlashcards, getAllUserNotes, chatWithDocument} = require('../controllers/study.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

// All study material generation requires authentication
router.use(verifyJWT);

router.get('/my/quizzes', getAllUserQuizzes);
router.get('/my/flashcards', getAllUserFlashcards);
router.get('/my/notes', getAllUserNotes);

// Document specific generations
router.post('/:documentId/chat', chatWithDocument);
router.post('/:documentId/quiz', generateQuiz);
router.post('/:documentId/flashcards', generateFlashcards);
router.post('/:documentId/notes', generateNotes);
router.get('/:documentId/quizzes', getSavedQuizzes)
router.get('/:documentId/notes', getSavedNotes);
router.get('/:documentId/flashcards', getSavedFlashcards);

// Knowledge Graph Endpoints
router.post('/:documentId/graph', generateKnowledgeGraph);
router.get('/:documentId/graph', getKnowledgeGraph);

module.exports = router;