require("dotenv").config();
const mongoose = require("mongoose");
const Submission = require("./models/Submission");
const Problem = require("./models/Problem");
const connectDB = require("./config/db");
const { runCodeforcesSubmission } = require("./utils/codeforcesSubmitter");

const run = async () => {
  try {
    await connectDB();
    console.log("Connected to DB.");
    
    // Find the latest CF-4A submission
    const sub = await Submission.findOne({ problemId: "CF-4A" }).sort({ submittedAt: -1 });
    if (!sub) {
      console.log("No CF-4A submission found.");
      return;
    }
    
    console.log("Found submission:", sub._id, "for problem:", sub.problemId);
    
    const problem = await Problem.findOne({ problemId: sub.problemId });
    if (!problem) {
      console.log("Problem not found in DB.");
      return;
    }
    
    console.log("Running Codeforces submission judge...");
    await runCodeforcesSubmission(sub._id, problem, sub.language, sub.code);
    
    // Fetch updated submission
    const updatedSub = await Submission.findById(sub._id);
    console.log("Updated submission verdict:", updatedSub.verdict);
    console.log("Time:", updatedSub.executionTime, "Memory:", updatedSub.memoryUsed);
    
  } catch (err) {
    console.error("Test failed with error:", err.stack);
  } finally {
    mongoose.connection.close();
  }
};

run();
