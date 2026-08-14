require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const username = process.argv[2];

if (!username) {
  console.error("Usage: node make-admin.js <username>");
  process.exit(1);
}

const promote = async () => {
  try {
    // Initialize connection
    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { username: username.trim() },
      { role: "admin" },
      { new: true }
    );
    
    if (!user) {
      console.error(`User '${username}' not found in the database.`);
    } else {
      console.log(`\x1b[32mSuccess: '${username}' has been promoted to Admin!\x1b[0m`);
    }
  } catch (err) {
    console.error("Error promoting user:", err.message);
  } finally {
    mongoose.connection.close();
  }
};

promote();
