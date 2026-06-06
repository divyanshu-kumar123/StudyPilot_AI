const Analytics = require('../models/analytics.model');
const UserProgress = require('../models/userProgress.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.getUserDashboard = catchAsync(async (req, res) => {
    const userId = req.user._id;

    // Fetch or initialize analytics (Upsert pattern)
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
        analytics = await Analytics.create({ userId });
    }

    // Fetch recent document progress (limit to 5 for the dashboard UI)
    const recentProgress = await UserProgress.find({ userId })
        .populate('documentId', 'title category thumbnailUrl')
        .sort({ lastAccessedAt: -1 })
        .limit(5);

    res.status(200).json(
        new ApiResponse(200, { analytics, recentProgress }, 'Dashboard analytics retrieved successfully')
    );
});

// We will call this internally or via a route when a user completes a quiz
exports.recordQuizAttempt = catchAsync(async (req, res) => {
    const { score, totalQuestions, topics } = req.body;
    const userId = req.user._id;

    const percentage = (score / totalQuestions) * 100;

    const analytics = await Analytics.findOne({ userId });
    if (!analytics) {
        throw new ApiError(404, 'Analytics profile not found');
    }

    // Recalculate moving average for quiz scores
    const currentTotal = analytics.averageQuizScore * analytics.totalQuizzesCompleted;
    const newTotal = currentTotal + percentage;
    
    analytics.totalQuizzesCompleted += 1;
    analytics.averageQuizScore = newTotal / analytics.totalQuizzesCompleted;
    analytics.lastStudiedAt = new Date();
    
    // Simple streak logic: if last studied was yesterday, increment. 
    // (This can be made more robust with cron jobs later)
    analytics.streakCount += 1; 

    await analytics.save();

    res.status(200).json(new ApiResponse(200, analytics, 'Quiz attempt recorded and analytics updated'));
});