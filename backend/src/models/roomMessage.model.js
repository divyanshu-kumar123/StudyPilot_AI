const mongoose = require('mongoose');

const roomMessageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'system', 'quiz_share'], default: 'text' }
}, {
    timestamps: true
});

// Index to fetch chronological chat history for a specific room quickly
roomMessageSchema.index({ roomId: 1, createdAt: 1 });

const RoomMessage = mongoose.model('RoomMessage', roomMessageSchema);
module.exports = RoomMessage;