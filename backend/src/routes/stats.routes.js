const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

/* GET URL SHORTENER STATS */
router.get("/stats", async (req, res) => {
  try {

    const urls = await pool.query("SELECT COUNT(*) FROM urls");

    const clicks = await pool.query(
      "SELECT COALESCE(SUM(clicks), 0) AS total_clicks FROM urls"
    );

    res.json({
      totalUrls: urls.rows[0].count,
      totalClicks: clicks.rows[0].total_clicks
    });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
