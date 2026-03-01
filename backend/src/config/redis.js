const { createClient } = require("redis");

let redisClient;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Error:", err.message);
  });
} else {
  console.log("⚠️ Redis not configured");
}

const connectRedis = async () => {
  if (!redisClient) return;

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("✅ Redis connected");
    }
  } catch (err) {
    console.log("⚠️ Redis connection failed. Continuing without cache.");
  }
};

module.exports = { redisClient, connectRedis };