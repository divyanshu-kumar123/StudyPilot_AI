const { Router } = require('express');
const { generateQuiz, generateFlashcards, generateNotes } = require('../controllers/study.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

// All study material generation requires authentication
router.use(verifyJWT);

// Document specific generations
router.post('/:documentId/quiz', generateQuiz);
router.post('/:documentId/flashcards', generateFlashcards);
router.post('/:documentId/notes', generateNotes);

module.exports = router;