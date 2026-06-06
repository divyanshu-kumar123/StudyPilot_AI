const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
    title: { type: String, required: true },
    noteType: { type: String, enum: ['summary', 'detailed', 'key_points'], default: 'summary' },
    content: { type: String, required: true },
    generatedByAI: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    tags: [{ type: String }]
}, {
    timestamps: true
});

notesSchema.index({ userId: 1, documentId: 1 });
notesSchema.index({ noteType: 1 });
notesSchema.index({ title: 'text', content: 'text' });

const Notes = mongoose.model('Notes', notesSchema);
module.exports = Notes;