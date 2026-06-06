const { Router } = require('express');
const { uploadDocument } = require('../controllers/document.controller');
const verifyJWT = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = Router();

// All document routes require authentication
router.use(verifyJWT);

// Expects form-data with a file field named 'document'
router.post('/upload', upload.single('document'), uploadDocument);

module.exports = router;