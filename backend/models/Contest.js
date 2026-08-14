const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    contestName: {
      type: String,
      required: [true, "Contest name is required"],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    durationHours: {
      type: Number,
      min: 0,
      default: 2,
    },
    durationMinutes: {
      type: Number,
      min: 1,
      default: 120,
    },
    type: {
      type: String,
      enum: ["ICPC", "IOI"],
      default: "ICPC",
    },
    isRated: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: "",
    },
    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    status: {
      type: String,
      enum: ["Upcoming", "Running", "Ended"],
      default: "Upcoming",
    },
    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    participants: [{ type: String }], // usernames registered
    registeredUsers: [{ type: String }], // registered usernames array
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// Virtual to compute end time
contestSchema.virtual("endTime").get(function () {
  if (!this.startTime) return null;
  const minutes = this.durationMinutes || (this.durationHours * 60) || 120;
  return new Date(this.startTime.getTime() + minutes * 60 * 1000);
});

contestSchema.set("toJSON", { virtuals: true });
contestSchema.set("toObject", { virtuals: true });

// Helper to compute live status based on current time
contestSchema.methods.computeStatus = function () {
  const now = new Date();
  const minutes = this.durationMinutes || (this.durationHours * 60) || 120;
  const end = new Date(this.startTime.getTime() + minutes * 60 * 1000);
  if (now < this.startTime) return "Upcoming";
  if (now >= this.startTime && now < end) return "Running";
  return "Ended";
};

module.exports = mongoose.model("Contest", contestSchema);
