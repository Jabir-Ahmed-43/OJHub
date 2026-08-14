const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern mongoose (>=6) doesn't need useNewUrlParser/useUnifiedTopology,
      // but they're harmless if present in older versions.
    });
    console.log(`[OJHub] MongoDB connected: 
      ${conn.connection.host}`);
  } catch (err) {
    console.error(`[OJHub] MongoDB connection error: ${err.message}`);
    console.warn("[OJHub] Warning: Continuing with offline database. Database operations will time out.");
  }
};

module.exports = connectDB;
