const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      index: true,
    },
    problemId: {
      type: String,
      required: [true, "Problem ID is required"],
      index: true,
    },
    problemTitle: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: ["cpp", "java", "python", "javascript", "c"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    verdict: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Runtime Error",
        "Compilation Error",
        "Submission Error",
      ],
      default: "Pending",
    },
    executionTime: {
      type: Number, // ms
      default: 0,
    },
    memoryUsed: {
      type: Number, // KB
      default: 0,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      default: null,
    },
    isPractice: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

submissionSchema.index({ username: 1, submittedAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
