const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

// Security & Utility Middlewares
app.use(helmet()); // Secures HTTP headers
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'your_production_url' : 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses cookies for our refresh tokens

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'StudyPilot AI Server is healthy and running.' });
});

module.exports = app;