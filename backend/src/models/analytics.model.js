const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalStudyHours: { type: Number, default: 0 },
    totalDocumentsProcessed: { type: Number, default: 0 },
    totalQuizzesCompleted: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 },
    strongestTopics: [{ type: String }],
    weakestTopics: [{ type: String }],
    streakCount: { type: Number, default: 0 },
    lastStudiedAt: { type: Date }
}, {
    timestamps: true
});

// Index for leaderboards and fast fetching
analyticsSchema.index({ averageQuizScore: -1 });
analyticsSchema.index({ streakCount: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;