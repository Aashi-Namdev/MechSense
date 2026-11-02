require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();
const port = process.env.PORT || 5000;

// Only the local React dev server(s) listed in .env may call this backend.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api", predictionRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Last-resort handler so unexpected errors never leak stack traces.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }

  console.error("Unexpected server error:", err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(port, () => {
  console.log(`MechSense backend running on http://localhost:${port}`);
});
