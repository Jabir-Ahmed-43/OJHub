require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const contestRoutes = require("./routes/contestRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ---------- Middleware ----------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Connect to MongoDB ----------
connectDB();

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "OJHub API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ---------- Global error handler ----------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[OJHub] Server running on port ${PORT}`);
});

module.exports = app;
