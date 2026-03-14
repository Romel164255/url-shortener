const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const urlRoutes = require("./routes/url.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Loose limiter for all routes (redirects, etc.)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict limiter only for URL creation
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 new short URLs per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many URLs created from this IP, try again in an hour.",
  },
});

app.use(globalLimiter);
app.use("/shorten", createLimiter);

app.use("/", urlRoutes);

app.use(errorHandler);

module.exports = app;