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

  const originalUrl = rows[0].original_url;

  try {
    if (redisClient) {
      await redisClient.set(shortId, originalUrl, { EX: 3600 });
    }
  } catch {}

  await pool.query(
    `UPDATE urls SET clicks = clicks + 1 WHERE short_id = $1`,
    [shortId]
  );

  return originalUrl;
};