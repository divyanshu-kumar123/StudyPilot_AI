const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomName: { type: String, required: true, trim: true },
    roomCode: { type: String, required: true, unique: true }, // e.g., a short 6-character code to share
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes for quick lookups
roomSchema.index({ roomCode: 1 });
roomSchema.index({ createdBy: 1 });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;