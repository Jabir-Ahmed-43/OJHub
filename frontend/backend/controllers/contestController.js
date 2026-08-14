const Contest = require("../models/Contest");
const Submission = require("../models/Submission");

// @route  GET /api/contests
// @access Public
exports.getContests = async (req, res) => {
  try {
    const filter = {};
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin) {
      filter.approvalStatus = "Approved";
    }

    const contests = await Contest.find(filter).populate("problems", "problemId title difficulty").sort({ startTime: -1 });

    // Recompute live status on the fly
    const withStatus = contests.map((c) => {
      const obj = c.toObject();
      obj.status = c.computeStatus();
      return obj;
    });

    return res.status(200).json({ success: true, count: withStatus.length, contests: withStatus });
  } catch (err) {
    console.error("GetContests error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching contests." });
  }
};

// @route  GET /api/contests/:id
// @access Public
exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems");
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }
    const obj = contest.toObject();
    obj.status = contest.computeStatus();

    // Fetch all submissions associated with this contest
    const submissions = await Submission.find({ contestId: contest._id })
      .select("username problemId verdict executionTime submittedAt")
      .sort({ submittedAt: 1 });

    obj.submissions = submissions;

    return res.status(200).json({ success: true, contest: obj });
  } catch (err) {
    console.error("GetContestById error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching contest." });
  }
};

// @route  POST /api/contests
// @access Private/Admin
exports.createContest = async (req, res) => {
  try {
    const { contestName, startTime, durationHours, type, isRated, description, problems } = req.body;

    if (!contestName || !startTime || !durationHours) {
      return res.status(400).json({
        success: false,
        message: "contestName, startTime, and durationHours are required.",
      });
    }

    const isUserAdmin = req.user && req.user.role === "admin";
    const initialApproval = isUserAdmin ? "Approved" : "Pending";

    const contest = await Contest.create({
      contestName,
      startTime,
      durationHours,
      type: type || "ICPC",
      isRated: isRated !== undefined ? isRated : true,
      description: description || "",
      problems: problems || [],
      createdBy: req.user.username,
      approvalStatus: initialApproval,
    });

    return res.status(201).json({ success: true, message: "Contest created successfully.", contest });
  } catch (err) {
    console.error("CreateContest error:", err);
    return res.status(500).json({ success: false, message: "Server error creating contest." });
  }
};

// @route  PUT /api/contests/:id
// @access Private/Admin
exports.updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }
    return res.status(200).json({ success: true, message: "Contest updated successfully.", contest });
  } catch (err) {
    console.error("UpdateContest error:", err);
    return res.status(500).json({ success: false, message: "Server error updating contest." });
  }
};

// @route  DELETE /api/contests/:id
// @access Private/Admin
exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }
    return res.status(200).json({ success: true, message: "Contest deleted successfully." });
  } catch (err) {
    console.error("DeleteContest error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting contest." });
  }
};

// @route  POST /api/contests/:id/register
// @access Private
exports.registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found." });
    }

    const username = req.body.username || req.user?.username;
    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required." });
    }

    if (!contest.registeredUsers) {
      contest.registeredUsers = [];
    }
    if (!contest.participants) {
      contest.participants = [];
    }

    const isRegistered = contest.registeredUsers.includes(username) || contest.participants.includes(username);
    if (isRegistered) {
      return res.status(409).json({ success: false, message: "Already registered for this contest." });
    }

    contest.registeredUsers.push(username);
    contest.participants.push(username);

    await contest.save();
    return res.status(200).json({ success: true, message: "Registered successfully." });
  } catch (err) {
    console.error("RegisterForContest error:", err);
    return res.status(500).json({ success: false, message: "Server error registering for contest." });
  }
};
