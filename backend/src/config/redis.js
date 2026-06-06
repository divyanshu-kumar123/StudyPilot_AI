const Redis = require('ioredis');

const redisConnection = new Redis(process.env.REDIS_URI, {
    maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('connect', () => console.log('[Redis] Connected successfully'));
redisConnection.on('error', (err) => console.error(`[Redis] Connection Error: ${err.message}`));

module.exports = redisConnection;