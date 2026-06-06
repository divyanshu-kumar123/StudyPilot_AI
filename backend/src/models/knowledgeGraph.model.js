const mongoose = require('mongoose');

const knowledgeGraphSchema = new mongoose.Schema({
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true, unique: true },
    nodes: [{
        id: { type: String, required: true },       // Unique string ID for graph mapping (e.g., "node_1")
        label: { type: String, required: true },    // The name of the concept (e.g., "CAP Theorem")
        type: { type: String, default: 'concept' } // Category classification (e.g., "term", "formula", "concept")
    }],
    edges: [{
        source: { type: String, required: true },   // The starting node ID
        target: { type: String, required: true },   // The ending node ID
        relationship: { type: String }             // Brief link description (e.g., "defines", "depends on")
    }],
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

knowledgeGraphSchema.index({ documentId: 1 });

const KnowledgeGraph = mongoose.model('KnowledgeGraph', knowledgeGraphSchema);
module.exports = KnowledgeGraph;