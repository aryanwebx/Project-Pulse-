const jwt = require('jsonwebtoken');
const redis = require('../config/redis'); // Import our central Redis client

/**
 * Add token to Redis blacklist with an automatic expiration.
 */
const addToBlacklist = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      console.error('Cannot blacklist token: Invalid token or missing expiration.');
      return;
    }

    // Get the token's expiration timestamp (in seconds)
    const expirationInSeconds = decoded.exp;

    // Get the current time (in seconds)
    const nowInSeconds = Math.floor(Date.now() / 1000);

    // Calculate the remaining time-to-live (TTL) for the token in seconds.
    // We add a 1-second buffer just in case.
    const ttl = (expirationInSeconds - nowInSeconds) + 1;

    if (ttl <= 0) {
      // Token is already expired, no need to add it.
      return;
    }

    // Store the token in Redis.
    // 'EX' sets the expiration in seconds (Math.ceil to round up).
    // This command tells Redis to automatically delete this key after 'ttl' seconds.
    await redis.set(token, 'blacklisted', 'EX', Math.ceil(ttl));

  } catch (error) {
    console.error('Error adding token to Redis blacklist:', error.message);
  }
};

/**
 * Check if token is in the Redis blacklist.
 */
const isTokenBlacklisted = async (token) => {
  try {
    // 'exists' returns 1 if the key exists, 0 if not.
    const result = await redis.exists(token);
    return result === 1;
  } catch (error) {
    console.error('Error checking Redis blacklist:', error.message);
    // Failsafe: If Redis fails, assume token is NOT blacklisted
    // to avoid locking users out.
    return false;
  }
};

/**
 * Get blacklist size (for debugging)
 * Note: dbsize() returns ALL keys in the current DB, not just blacklisted ones.
 */
const getBlacklistSize = async () => {
  try {
    return await redis.dbsize();
  } catch (error) {
    console.error('Error getting Redis DB size:', error.message);
    return 0;
  }
};

/**
 * Clear entire blacklist (for testing)
 * DANGEROUS: This clears the ENTIRE current Redis database.
 */
const clearBlacklist = async () => {
  try {
    return await redis.flushdb();
  } catch (error) {
    console.error('Error flushing Redis DB:', error.message);
  }
};

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  getBlacklistSize,
  clearBlacklist
};