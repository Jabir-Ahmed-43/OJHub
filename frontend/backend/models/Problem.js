const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    problemId: {
      type: String,
      required: [true, "Problem ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      default: "Easy",
    },
    tags: [{ type: String, trim: true }],
    timeLimit: {
      type: Number, // in seconds
      default: 1,
    },
    memoryLimit: {
      type: Number, // in MB
      default: 256,
    },
    problemStatement: {
      type: String,
      required: [true, "Problem statement is required"],
    },
    inputFormat: { type: String, default: "" },
    outputFormat: { type: String, default: "" },
    constraints: { type: String, default: "" },
    examples: [exampleSchema],
    testCases: [testCaseSchema],
    status: {
      type: String,
      enum: ["Pending", "Published", "Draft", "Archived"],
      default: "Draft",
    },
    totalSubmissions: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    createdBy: {
      type: String, // admin username
      default: "admin",
    },
  },
  { timestamps: true }
);

problemSchema.index({ title: "text" });
problemSchema.index({ tags: 1 });

const Problem = mongoose.model("Problem", problemSchema);
mongoose.connection.on("connected", () => {
  Problem.collection.dropIndex("title_text_tags_1").catch(() => {});
});

module.exports = Problem;
