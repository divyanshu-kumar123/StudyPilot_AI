require('dotenv').config();
const http = require('http');
const app = require('./app.js');
const connectDB = require('./src/config/db.js');
const { initSocket } = require('./src/sockets/socketManager.js');

// Import the worker so it starts listening to the Redis queue
require('./src/workers/pdfProcessor.worker.js'); 

const PORT = process.env.PORT || 8000;

// Wrap the Express app with Node's native HTTP server
const server = http.createServer(app);

// Initialize WebSockets on the server
initSocket(server);

const startServer = async () => {
    await connectDB();
    
    // Note: We are now calling server.listen() instead of app.listen()
    server.listen(PORT, () => {
        console.log(`[Server] StudyPilot AI running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();