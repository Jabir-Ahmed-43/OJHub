const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ratingHistorySchema = new mongoose.Schema(
  {
    contestName: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    rating: {
      type: Number,
      default: 1200,
    },
    maxRating: {
      type: Number,
      default: 1200,
    },
    fullName: { type: String, default: "" },
    bio: { type: String, default: "" },
    institute: { type: String, default: "" },
    country: { type: String, default: "" },
    solvedProblems: [{ type: String }], // problemId list
    ratingHistory: [ratingHistorySchema],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    rating: this.rating,
    maxRating: this.maxRating,
    fullName: this.fullName,
    bio: this.bio,
    institute: this.institute,
    country: this.country,
    solvedProblems: this.solvedProblems,
    ratingHistory: this.ratingHistory,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
