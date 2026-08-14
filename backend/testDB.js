require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Problem = require("./models/Problem");
const Contest = require("./models/Contest");
const connectDB = require("./config/db");

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to DB.");
    const user = await User.findOne({ username: "testuser" });
    if (!user) {
      console.log("testuser not found");
    } else {
      console.log("Found user:", user.username);
      const proposedProblems = await Problem.find({ createdBy: user.username });
      console.log("Proposed problems count:", proposedProblems.length);
      const hostedContests = await Contest.find({ createdBy: user.username });
      console.log("Hosted contests count:", hostedContests.length);
    }
  } catch (err) {
    console.error("Test failed with error:", err.stack);
  } finally {
    mongoose.connection.close();
  }
};

run();
