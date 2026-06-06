const { Queue } = require('bullmq');
const redisConnection = require('../config/redis');

// Initialize the queue that will hold our PDF processing jobs
const pdfQueue = new Queue('pdf-processing-queue', { 
    connection: redisConnection 
});

module.exports = { pdfQueue };