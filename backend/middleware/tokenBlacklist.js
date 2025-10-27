// Simple in-memory token blacklist
// In production, you might want to use Redis or database for this

const tokenBlacklist = new Set();

/**
 * Add token to blacklist
 */
const addToBlacklist = (token) => {
  tokenBlacklist.add(token);
  // Optional: Remove token from blacklist after expiration time
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000); // 24 hours
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Get blacklist size (for debugging)
 */
const getBlacklistSize = () => {
  return tokenBlacklist.size;
};

/**
 * Clear entire blacklist (for testing)
 */
const clearBlacklist = () => {
  tokenBlacklist.clear();
};

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  getBlacklistSize,
  clearBlacklist
};