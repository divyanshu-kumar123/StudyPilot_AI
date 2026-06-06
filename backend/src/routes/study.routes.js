const { Router } = require('express');
const { generateQuiz } = require('../controllers/study.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

// All study material generation requires authentication
router.use(verifyJWT);

// Document specific generations
router.post('/:documentId/quiz', generateQuiz);

module.exports = router;