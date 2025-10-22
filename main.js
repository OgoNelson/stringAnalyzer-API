const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const stringsRouter = require("./router/strings.router");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/strings", stringsRouter);

// Root and health
app.get("/", (req, res) =>
  res.status(200).json({ status: "success", message: "String Analyzer API" })
);
app.get("/health", (req, res) =>
  res.status(200).json({ status: "success", message: "OK" })
);

// Fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
