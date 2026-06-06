const User = require('../models/user.model');
const Session = require('../models/session.model');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

// Helper to generate tokens and store session
const generateAccessAndRefreshTokens = async (userId, req) => {
    const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

    // Calculate expiry date for the session document
    const expiresInDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) || 7;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await Session.create({
        userId,
        refreshToken,
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent'],
        expiresAt
    });

    return { accessToken, refreshToken };
};

// Cookie options for secure token storage
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

exports.registerUser = catchAsync(async (req, res) => {
    const { fullName, email, password } = req.body;

    if ([fullName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({ fullName, email, password });
    const createdUser = await User.findById(user._id).select("-password");

    res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

exports.loginUser = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, req);
    const loggedInUser = await User.findById(user._id).select("-password");

    res.status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully"));
});

exports.logoutUser = catchAsync(async (req, res) => {
    // Remove the session from the database using the refresh token
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await Session.findOneAndDelete({ refreshToken });
    }

    res.status(200)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

exports.refreshAccessToken = catchAsync(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Find session and user
        const session = await Session.findOne({ refreshToken: incomingRefreshToken });
        if (!session) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // Delete old session and generate new tokens (Token Rotation)
        await Session.findByIdAndDelete(session._id);
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, req);

        res.status(200)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});