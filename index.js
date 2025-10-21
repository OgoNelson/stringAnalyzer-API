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

// Error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
