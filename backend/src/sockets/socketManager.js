const { Server } = require('socket.io');
const RoomMessage = require('../models/roomMessage.model');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production' ? 'your_production_url' : 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        // Handle joining a specific room channel
        socket.on('join-room', (roomCode) => {
            socket.join(roomCode);
            console.log(`[Socket] User ${socket.id} joined room: ${roomCode}`);
            
            // Broadcast to others in the room
            socket.to(roomCode).emit('system-message', {
                message: 'A new user has joined the study room.',
                timestamp: new Date()
            });
        });

        // Handle incoming chat messages
        socket.on('send-message', async (data) => {
            const { roomCode, roomId, senderId, message, senderName } = data;

            try {
                // 1. Persist the message in MongoDB
                const newMessage = await RoomMessage.create({
                    roomId,
                    senderId,
                    message,
                    messageType: 'text'
                });

                // 2. Broadcast the message to everyone in the room (including sender)
                io.to(roomCode).emit('receive-message', {
                    _id: newMessage._id,
                    senderId,
                    senderName,
                    message,
                    messageType: 'text',
                    createdAt: newMessage.createdAt
                });
            } catch (error) {
                console.error('[Socket] Error saving message:', error.message);
                socket.emit('error-message', { error: 'Message failed to send.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });

    console.log('[Socket] WebSocket server initialized.');
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIO };