const Redis = require('ioredis');

// ioredis will automatically use process.env.REDIS_URL if it's set.
// This makes it work perfectly in both local and production environments.
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3, // Optional: retry 3 times on connection error
  enableReadyCheck: false,
});

redis.on('connect', () => {
  console.log('✅ Redis client connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

module.exports = redis;