import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

/* GET URL SHORTENER STATS */
router.get("/stats", async (req, res) => {
  try {

    const urls = await pool.query("SELECT COUNT(*) FROM urls");

    const clicks = await pool.query(
      "SELECT SUM(click_count) FROM urls"
    );

    res.json({
      totalUrls: urls.rows[0].count,
      totalClicks: clicks.rows[0].sum || 0
    });

  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;