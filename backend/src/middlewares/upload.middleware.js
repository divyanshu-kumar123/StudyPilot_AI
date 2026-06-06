const multer = require('multer');
const ApiError = require('../utils/apiError');

// Store in memory so we can stream it directly to Cloudinary without touching local disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Invalid file type. Only PDF files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter
});

module.exports = upload;