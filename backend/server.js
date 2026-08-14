require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const contestRoutes = require("./routes/contestRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "OJHub API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

const mongoose = require("mongoose");

const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`[OJHub] Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n[OJHub Error] Port ${PORT} is already in use.`);
    console.error(`You can kill the process using this port by running:`);
    console.error(`  kill -9 $(lsof -t -i:${PORT})\n`);
    process.exit(1);
  }
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n[OJHub] Shutting down gracefully on ${signal}...`);
  server.close(() => {
    console.log("[OJHub] HTTP server closed.");
    mongoose.connection.close(false).then(() => {
      console.log("[OJHub] MongoDB connection closed.");
      process.exit(0);
    }).catch((err) => {
      console.error("[OJHub] Error closing MongoDB connection:", err);
      process.exit(1);
    });
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle nodemon restarts
process.once("SIGUSR2", () => {
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      process.kill(process.pid, "SIGUSR2");
    });
  });
});

module.exports = app;
