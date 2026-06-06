const Document = require('../models/document.model');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

exports.globalSearch = catchAsync(async (req, res) => {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.trim() === '') {
        return res.status(200).json(new ApiResponse(200, { documents: [] }, 'Empty search'));
    }

    // Utilize the text index we created on the Document model
    const documents = await Document.find(
        { userId, $text: { $search: q } },
        { score: { $meta: "textScore" } } // Fetch relevance score
    )
    .sort({ score: { $meta: "textScore" } }) // Sort by best match
    .select('title processingStatus category') // Only send necessary UI data
    .limit(5);

    res.status(200).json(new ApiResponse(200, { documents }, 'Search results retrieved successfully'));
});