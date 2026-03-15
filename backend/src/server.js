require("dotenv").config();

const app = require("./app");
const { pool } = require("./config/db");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected");

    await connectRedis(); // connect redis properly

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
}

startServer();
