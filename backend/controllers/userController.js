const User = require("../models/User");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const Contest = require("../models/Contest");

// @route  GET /api/users
// @access Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((u) => u.toSafeObject()),
    });
  } catch (err) {
    console.error("GetAllUsers error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching users." });
  }
};

// @route  GET /api/users/:username
// @access Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const submissions = await Submission.find({ username: user.username }).sort({ submittedAt: -1 });

    const totalSubmissions = submissions.length;
    const accepted = submissions.filter((s) => s.verdict === "Accepted").length;

    // Topic mastery: count solved-accepted submissions per tag isn't directly
    // available here (tags live on Problem), so we approximate via verdict
    // distribution which the frontend combines with problem tag data.
    const verdictBreakdown = submissions.reduce((acc, s) => {
      acc[s.verdict] = (acc[s.verdict] || 0) + 1;
      return acc;
    }, {});

    const proposedProblems = await Problem.find({ createdBy: user.username }).sort({ createdAt: -1 });
    const hostedContests = await Contest.find({ createdBy: user.username }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user: user.toSafeObject(),
      stats: {
        totalSubmissions,
        accepted,
        solvedCount: user.solvedProblems.length,
        verdictBreakdown,
      },
      recentSubmissions: submissions.slice(0, 20),
      submissionDates: submissions.map(s => s.submittedAt),
      proposedProblems,
      hostedContests,
    });
  } catch (err) {
    console.error("GetUserProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching profile." });
  }
};

// @route  PUT /api/users/:id/role
// @access Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, message: "User role updated.", user: user.toSafeObject() });
  } catch (err) {
    console.error("UpdateUserRole error:", err);
    return res.status(500).json({ success: false, message: "Server error updating role." });
  }
};

// @route  DELETE /api/users/:id
// @access Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("DeleteUser error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting user." });
  }
};

// @route  PUT /api/users/profile
// @access Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { fullName, bio, institute, country } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (institute !== undefined) user.institute = institute;
    if (country !== undefined) user.country = country;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("UpdateUserProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error updating profile." });
  }
};
