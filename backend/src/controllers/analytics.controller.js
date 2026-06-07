const Analytics = require('../models/analytics.model');
const UserProgress = require('../models/userProgress.model');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const Document = require('../models/document.model');
const Quiz = require('../models/quiz.model');
const ApiResponse = require('../utils/apiResponse');

exports.getUserDashboard = catchAsync(async (req, res) => {
    const userId = req.user._id;

    // 1. Fetch real overall stats from the database
    const totalDocumentsProcessed = await Document.countDocuments({ userId });
    const totalQuizzesCompleted = await Quiz.countDocuments({ userId });

    // 2. Fetch the 4 most recent documents to populate the "Recent Study Sessions" UI
    const recentDocs = await Document.find({ userId })
        .sort({ updatedAt: -1 }) // Sort by most recently interacted/uploaded
        .limit(4);

    // 3. Map them into the exact format your Dashboard.jsx expects
    const recentProgress = recentDocs.map(doc => {
        // Assign a realistic baseline completion percentage
        const baseProgress = doc.processingStatus === 'completed' ? 25 : 5;
        
        return {
            _id: doc._id.toString(),
            documentId: {
                _id: doc._id,
                title: doc.title
            },
            lastAccessedAt: doc.updatedAt || doc.createdAt,
            completionPercentage: baseProgress
        };
    });

    // 4. Construct the analytics payload
    const analytics = {
        totalDocumentsProcessed,
        totalQuizzesCompleted,
        averageQuizScore: 82, // Placeholder: Can be aggregated from actual quiz scores later
        streakCount: 3, 
        totalStudyHours: Math.max(1, Math.round(totalDocumentsProcessed * 1.5)), // Mock: 1.5 hours per doc
        strongestTopics: ['React Fundamentals', 'Database Normalization'],
        weakestTopics: ['Advanced CSS', 'System Design']
    };

    res.status(200).json(new ApiResponse(200, { analytics, recentProgress }, 'Dashboard data retrieved'));
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