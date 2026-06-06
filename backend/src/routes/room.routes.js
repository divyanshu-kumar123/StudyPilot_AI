const { Router } = require('express');
const { createRoom, joinRoom, getRoomHistory } = require('../controllers/room.controller');
const verifyJWT = require('../middlewares/auth.middleware');

const router = Router();

// All room actions require authentication
router.use(verifyJWT);

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.get('/:roomId/messages', getRoomHistory);

module.exports = router;