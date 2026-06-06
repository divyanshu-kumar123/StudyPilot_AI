const { Router } = require('express');
const { getUserDashboard, recordQuizAttempt } = require('../controllers/analytics.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

// Protect all analytics routes
router.use(verifyJWT);

router.get('/dashboard', getUserDashboard);
router.post('/quiz-attempt', recordQuizAttempt);

module.exports = router;