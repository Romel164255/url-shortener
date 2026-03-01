const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const urlRoutes = require("./routes/url.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use("/", urlRoutes);

app.use(errorHandler);

module.exports = app;