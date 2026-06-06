const { Router } = require('express');
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require('../controllers/auth.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken);

// Secured routes
router.post('/logout', verifyJWT, logoutUser);

module.exports = router;