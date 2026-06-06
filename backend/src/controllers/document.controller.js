const Document = require('../models/document.model');
const { pdfQueue } = require('../workers/queueProvider');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper function to stream buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'raw' }, // 'raw' is required for PDFs in Cloudinary
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

exports.uploadDocument = catchAsync(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'No document uploaded');
    }

    const userId = req.user._id;
    const originalFileName = req.file.originalname;
    const documentTitle = req.body.title || originalFileName.replace('.pdf', '');

    // 1. Upload file securely to Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, `studypilot/documents/${userId}`);

    // 2. Create the Document record in a 'pending' state
    const document = await Document.create({
        userId,
        title: documentTitle,
        originalFileName,
        fileUrl: cloudResult.secure_url,
        fileType: 'application/pdf',
        fileSize: req.file.size,
        processingStatus: 'pending'
    });

    // 3. Push job to BullMQ for async parsing and vectorization
    const job = await pdfQueue.add('process-pdf', {
        documentId: document._id,
        fileUrl: cloudResult.secure_url,
        userId
    });

    // 4. Attach the BullMQ Job ID to the document for tracking
    document.jobId = job.id;
    await document.save();

    res.status(201).json(
        new ApiResponse(201, document, 'Document uploaded successfully and queued for AI processing')
    );
});