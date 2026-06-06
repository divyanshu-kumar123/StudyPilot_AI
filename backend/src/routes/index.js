const { Router } = require('express');
const authRoutes = require('./auth.routes');
const documentRoutes = require('./document.routes');
const studyRoutes = require('./study.routes');
const roomRoutes = require('./room.routes');
const analyticsRoutes = require('./analytics.routes');
const searchRoutes = require('./search.routes');

const router = Router();

// Version 1 of the API
router.use('/v1/auth', authRoutes);
router.use('/v1/documents', documentRoutes);
router.use('/v1/study', studyRoutes);
router.use('/v1/rooms', roomRoutes);
router.use('/v1/analytics', analyticsRoutes);
router.use('/v1/search', searchRoutes);

module.exports = router;