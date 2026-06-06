const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    originalFileName: { 
        type: String, 
        required: true 
    },
    fileUrl: { 
        type: String, 
        required: true 
    }, // This will hold our secure Cloudinary URL
    fileType: { 
        type: String, 
        required: true 
    },
    fileSize: { 
        type: Number, 
        required: true 
    }, // Stored in bytes
    totalPages: { 
        type: Number, 
        default: 0 
    },
    extractedText: { 
        type: String, 
        default: '' 
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    jobId: { 
        type: String 
    }, // Ties the document to the BullMQ job
    category: { 
        type: String, 
        default: 'uncategorized' 
    },
    tags: [{ 
        type: String 
    }],
    detectedTopics: [{ 
        type: String 
    }],
    summary: { 
        type: String, 
        default: '' 
    },
    thumbnailUrl: { 
        type: String, 
        default: '' 
    },
    language: { 
        type: String, 
        default: 'en' 
    },
    isPublic: { 
        type: Boolean, 
        default: false 
    },
    processingStartedAt: { 
        type: Date 
    },
    processingCompletedAt: { 
        type: Date 
    }
}, {
    timestamps: true
});

// --- Performance & Search Indexes ---

// Standard Indexes
documentSchema.index({ userId: 1 });
documentSchema.index({ processingStatus: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ detectedTopics: 1 });
documentSchema.index({ createdAt: -1 });

// Text Index for full-text search capabilities across titles and document content
documentSchema.index({ title: 'text', extractedText: 'text' });

// Compound Index for fast fetching of a specific user's documents by category
documentSchema.index({ userId: 1, category: 1 });

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;