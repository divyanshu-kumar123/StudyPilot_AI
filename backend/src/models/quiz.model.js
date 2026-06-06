const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    title: { type: String, required: true },
    quizType: { type: String, enum: ['mcq', 'true_false', 'fill_blanks', 'mixed'], default: 'mcq' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    totalQuestions: { type: Number, required: true },
    estimatedTime: { type: Number }, // in minutes
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String }], // Optional, mainly for MCQs
        correctAnswer: { type: String, required: true },
        explanation: { type: String }
    }]
}, {
    timestamps: true
});

quizSchema.index({ userId: 1, documentId: 1 });
quizSchema.index({ difficulty: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;