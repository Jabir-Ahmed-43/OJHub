const Problem = require("../models/Problem");

// @route  GET /api/problems
// @access Public
exports.getProblems = async (req, res) => {
  try {
    const { search, difficulty, tag, status } = req.query;
    const filter = {};

    if (difficulty && difficulty !== "All") {
      filter.difficulty = difficulty;
    }
    if (tag && tag !== "All") {
      filter.tags = tag;
    }
    
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin) {
      filter.status = "Published";
    } else {
      if (status) {
        filter.status = status;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { problemId: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const problems = await Problem.find(filter)
      .select("-problemStatement -inputFormat -outputFormat -constraints -examples")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: problems.length, problems });
  } catch (err) {
    console.error("GetProblems error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching problems." });
  }
};

// @route  GET /api/problems/:id
// @access Public (id can be Mongo _id or problemId)
exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    let problem = await Problem.findOne({ problemId: id.toUpperCase() });
    if (!problem) {
      problem = await Problem.findById(id).catch(() => null);
    }
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }
    return res.status(200).json({ success: true, problem });
  } catch (err) {
    console.error("GetProblemById error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching problem." });
  }
};

// @route  POST /api/problems
// @access Private/Admin
exports.createProblem = async (req, res) => {
  try {
    const {
      problemId,
      title,
      difficulty,
      tags,
      timeLimit,
      memoryLimit,
      problemStatement,
      inputFormat,
      outputFormat,
      constraints,
      examples,
      status,
    } = req.body;

    if (!problemId || !title || !problemStatement) {
      return res.status(400).json({
        success: false,
        message: "problemId, title, and problemStatement are required.",
      });
    }

    const existing = await Problem.findOne({ problemId: problemId.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Problem ID '${problemId}' already exists.`,
      });
    }

    const isUserAdmin = req.user && req.user.role === "admin";
    const initialStatus = isUserAdmin ? (status || "Draft") : "Pending";

    const problem = await Problem.create({
      problemId: problemId.trim().toUpperCase(),
      title,
      difficulty: difficulty || "Easy",
      tags: Array.isArray(tags) ? tags : (tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      timeLimit: timeLimit || 1,
      memoryLimit: memoryLimit || 256,
      problemStatement,
      inputFormat: inputFormat || "",
      outputFormat: outputFormat || "",
      constraints: constraints || "",
      examples: examples || [],
      status: initialStatus,
      createdBy: req.user.username,
    });

    return res.status(201).json({ success: true, message: "Problem created successfully.", problem });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Problem ID already exists." });
    }
    console.error("CreateProblem error:", err);
    return res.status(500).json({ success: false, message: "Server error creating problem." });
  }
};

// @route  PUT /api/problems/:id
// @access Private/Admin
exports.updateProblem = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = updates.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
    if (updates.problemId) {
      updates.problemId = updates.problemId.trim().toUpperCase();
    }

    const problem = await Problem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    return res.status(200).json({ success: true, message: "Problem updated successfully.", problem });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Problem ID already exists." });
    }
    console.error("UpdateProblem error:", err);
    return res.status(500).json({ success: false, message: "Server error updating problem." });
  }
};

// @route  DELETE /api/problems/:id
// @access Private/Admin
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }
    return res.status(200).json({ success: true, message: "Problem deleted successfully." });
  } catch (err) {
    console.error("DeleteProblem error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting problem." });
  }
};
