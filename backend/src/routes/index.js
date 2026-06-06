const { Router } = require('express');
const authRoutes = require('./auth.routes');
const documentRoutes = require('./document.routes');

const router = Router();

// Version 1 of the API
router.use('/v1/auth', authRoutes);
router.use('/v1/documents', documentRoutes);

module.exports = router;