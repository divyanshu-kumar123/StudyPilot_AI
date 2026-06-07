const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./src/routes/index');

const app = express();

// Security & Utility Middlewares
app.use(helmet()); // Secures HTTP headers
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://study-pilot-ai-sigma.vercel.app/' 
        : 'http://localhost:5173',
    credentials: true // Crucial for cookies/sessions
};
app.use(cors(corsOptions));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses cookies for our refresh tokens

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'StudyPilot AI Server is healthy and running.' });
});

app.use('/api', apiRoutes);

// Global Error Handler Middleware 
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

module.exports = app;