const Redis = require("ioredis");

// Redis supports token revocation. Keep its connection data in .env and do not
// prevent the API from booting if this optional service is temporarily down.
let redis = null;
let hasLoggedUnavailable = false;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    retryStrategy: (attempt) => (attempt > 3 ? null : Math.min(attempt * 250, 1000)),
  });

  redis.on("ready", () => {
    hasLoggedUnavailable = false;
    console.log("✅ Redis connected");
  });
  redis.on("error", (error) => {
    if (!hasLoggedUnavailable) {
      hasLoggedUnavailable = true;
      console.error(`⚠️ Redis unavailable: ${error.message}`);
    }
  });
} else {
  console.warn("⚠️ REDIS_URL is not set; token blacklist persistence is disabled.");
}

module.exports = redis;
