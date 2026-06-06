const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    expiresAt: { type: Date, required: true }
}, {
    timestamps: true
});

// TTL Index: MongoDB will automatically delete the document when expiresAt is reached
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;