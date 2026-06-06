const Room = require('../models/room.model');
const RoomMessage = require('../models/roomMessage.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const { v4: uuidv4 } = require('uuid');

exports.createRoom = catchAsync(async (req, res) => {
    const { roomName, description } = req.body;
    const userId = req.user._id;

    if (!roomName) {
        throw new ApiError(400, 'Room name is required');
    }

    // Generate a short, readable 6-character alphanumeric code
    const roomCode = uuidv4().substring(0, 6).toUpperCase();

    const room = await Room.create({
        roomName,
        roomCode,
        description,
        createdBy: userId,
        members: [userId] // The creator is automatically the first member
    });

    res.status(201).json(new ApiResponse(201, room, 'Study room created successfully'));
});

exports.joinRoom = catchAsync(async (req, res) => {
    const { roomCode } = req.body;
    const userId = req.user._id;

    if (!roomCode) {
        throw new ApiError(400, 'Room code is required');
    }

    const room = await Room.findOne({ roomCode, isActive: true });
    
    if (!room) {
        throw new ApiError(404, 'Study room not found or is no longer active');
    }

    // Add user to the members array if they aren't already in it
    if (!room.members.includes(userId)) {
        room.members.push(userId);
        await room.save();
    }

    res.status(200).json(new ApiResponse(200, room, 'Joined study room successfully'));
});

exports.getRoomHistory = catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Verify the room exists and the user is a member
    const room = await Room.findById(roomId);
    if (!room) {
        throw new ApiError(404, 'Room not found');
    }
    
    if (!room.members.includes(userId)) {
        throw new ApiError(403, 'You are not a member of this room');
    }

    // Fetch messages in chronological order, populating the sender's details
    const messages = await RoomMessage.find({ roomId })
        .populate('senderId', 'fullName profileImage')
        .sort({ createdAt: 1 });

    res.status(200).json(new ApiResponse(200, messages, 'Room history retrieved successfully'));
});