const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    topic: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    generatedByAI: { type: Boolean, default: true }
}, {
    timestamps: true
});

flashcardSchema.index({ userId: 1, documentId: 1 });
flashcardSchema.index({ topic: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);
module.exports = Flashcard;