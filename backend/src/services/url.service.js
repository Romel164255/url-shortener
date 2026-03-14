const pool = require("../config/db");
const generateShortId = require("../utils/generateShortId");
const { redisClient } = require("../config/redis");

const createShortUrl = async (originalUrl, customAlias, expiresIn = null) => {
  let shortId = customAlias || generateShortId();

  // 🔹 Check if shortId already exists
  const existingShort = await pool.query(
    `SELECT * FROM urls WHERE short_id = $1`,
    [shortId]
  );

  if (existingShort.rows.length > 0) {
    throw new Error("Custom URL already taken");
  }

  // 🔹 Calculate expiry timestamp if provided (expiresIn is in seconds)
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 1000)
    : null;

  const { rows } = await pool.query(
    `INSERT INTO urls (original_url, short_id, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [originalUrl, shortId, expiresAt]
  );

  return rows[0];
};

const getOriginalUrl = async (shortId) => {
  let cached = null;

  try {
    if (redisClient) {
      cached = await redisClient.get(shortId);
    }
  } catch {}

  if (cached) {
    await pool.query(
      `UPDATE urls SET clicks = clicks + 1 WHERE short_id = $1`,
      [shortId]
    );
    return cached;
  }

  const { rows } = await pool.query(
    `SELECT * FROM urls WHERE short_id = $1`,
    [shortId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];

  // 🔹 Check if the link has expired
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return "EXPIRED";
  }

  const originalUrl = row.original_url;

  // 🔹 Cache with a TTL that respects the expiry window
  try {
    if (redisClient) {
      const ttl = row.expires_at
        ? Math.floor((new Date(row.expires_at) - Date.now()) / 1000)
        : 3600;
      if (ttl > 0) await redisClient.set(shortId, originalUrl, { EX: ttl });
    }
  } catch {}

  await pool.query(
    `UPDATE urls SET clicks = clicks + 1 WHERE short_id = $1`,
    [shortId]
  );

  return originalUrl;
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
};