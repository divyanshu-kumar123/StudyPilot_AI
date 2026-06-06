require('dotenv').config();
const app = require('./app.js');
const connectDB = require('./src/config/db.js');
require('./src/workers/pdfProcessor.worker.js');

const PORT = process.env.PORT || 5000;

// Initialize Server
const startServer = async () => {
    // 1. Connect to Database first
    await connectDB();

    // 2. Start listening for requests
    app.listen(PORT, () => {
        console.log(`[Server] StudyPilot AI running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();