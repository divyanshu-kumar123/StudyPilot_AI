const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    completedTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    completionPercentage: { type: Number, default: 0 },
    lastAccessedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Compound index because a user has exactly one progress record per document
userProgressSchema.index({ userId: 1, documentId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
module.exports = UserProgress;