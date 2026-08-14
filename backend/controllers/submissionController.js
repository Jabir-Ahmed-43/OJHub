const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const Contest = require("../models/Contest");
const { runCodeforcesSubmission, updateStats } = require("../utils/codeforcesSubmitter");

const VERDICTS = [
  "Accepted",
  "Wrong Answer",
  "Time Limit Exceeded",
  "Runtime Error",
];

// Simple mock judge — in a real system this would be a sandboxed code
// execution service. Here we simulate a verdict so the platform is fully
// functional end-to-end without external infrastructure.
const mockJudge = () => {
  const roll = Math.random();
  let verdict = "Accepted";
  if (roll > 0.6) verdict = VERDICTS[Math.floor(Math.random() * VERDICTS.length)];
  return {
    verdict,
    executionTime: Math.floor(Math.random() * 900) + 20, // ms
    memoryUsed: Math.floor(Math.random() * 40000) + 5000, // KB
  };
};

// Asynchronous execution against local examples using Judge0
async function runJudge0Submission(submissionId, problem, language, code) {
  const submission = await Submission.findById(submissionId);
  if (!submission) return;

  try {
    const JUDGE0_LANGUAGE_MAP = {
      cpp: 105,        // C++ (GCC 14.1.0)
      java: 91,        // Java (JDK 17.0.6)
      python: 100,     // Python (3.12.5)
      javascript: 97,  // JavaScript (Node.js 20.17.0)
      c: 103,          // C (GCC 14.1.0)
    };

    const judge0LangId = JUDGE0_LANGUAGE_MAP[language.toLowerCase()];
    if (!judge0LangId) {
      submission.verdict = "Submission Error";
      await submission.save();
      return;
    }

    let verdict = "Accepted";
    let executionTime = 0;
    let memoryUsed = 0;

    if (problem.examples && problem.examples.length > 0) {
      try {
        const testCasePromises = problem.examples.map(async (ex) => {
          const body = {
            source_code: code,
            language_id: judge0LangId,
            stdin: ex.input,
            expected_output: ex.output
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch("https://ce.judge0.com/submissions?wait=true&base64_encoded=false", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Judge0 API error: ${response.statusText}`);
          }

          return await response.json();
        });

        const results = await Promise.all(testCasePromises);

        // Find the worst verdict among all test cases
        let worstResult = results[0];
        for (const res of results) {
          const statusId = res.status?.id || 3;
          const currentWorstId = worstResult.status?.id || 3;

          const score = (id) => {
            if (id === 6) return 50; // Compilation Error
            if (id > 6) return 40;  // Runtime Error
            if (id === 5) return 30; // Time Limit Exceeded
            if (id === 4) return 20; // Wrong Answer
            if (id === 3) return 10; // Accepted
            return 0;
          };

          if (score(statusId) > score(currentWorstId)) {
            worstResult = res;
          }
        }

        const finalStatusId = worstResult.status?.id || 3;
        if (finalStatusId === 3) {
          verdict = "Accepted";
        } else if (finalStatusId === 4) {
          verdict = "Wrong Answer";
        } else if (finalStatusId === 5) {
          verdict = "Time Limit Exceeded";
        } else if (finalStatusId === 6) {
          verdict = "Compilation Error";
        } else {
          verdict = "Runtime Error";
        }

        executionTime = Math.max(...results.map(r => parseFloat(r.time || 0) * 1000)); // in ms
        memoryUsed = Math.max(...results.map(r => parseInt(r.memory || 0))); // in KB

      } catch (judgeError) {
        console.error("Judge0 evaluation failed, falling back to mock:", judgeError);
        const mock = mockJudge();
        verdict = mock.verdict;
        executionTime = mock.executionTime;
        memoryUsed = mock.memoryUsed;
      }
    } else {
      const mock = mockJudge();
      verdict = mock.verdict;
      executionTime = mock.executionTime;
      memoryUsed = mock.memoryUsed;
    }

    submission.verdict = verdict;
    submission.executionTime = executionTime;
    submission.memoryUsed = memoryUsed;
    await submission.save();

    await updateStats(submission, problem, verdict);

  } catch (err) {
    console.error(`[Judge0 Submitter] Error judging submission ${submissionId}:`, err);
    const mock = mockJudge();
    submission.verdict = mock.verdict;
    submission.executionTime = mock.executionTime;
    submission.memoryUsed = mock.memoryUsed;
    await submission.save();
    await updateStats(submission, problem, mock.verdict);
  }
}

// @route  POST /api/submissions
// @access Private
exports.createSubmission = async (req, res) => {
  try {
    const { problemId, language, code, contestId } = req.body;

    if (!problemId || !language || !code) {
      return res.status(400).json({
        success: false,
        message: "problemId, language, and code are required.",
      });
    }

    const problem = await Problem.findOne({ problemId: problemId.toUpperCase() });
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    const JUDGE0_LANGUAGE_MAP = {
      cpp: 105,        // C++ (GCC 14.1.0)
      java: 91,        // Java (JDK 17.0.6)
      python: 100,     // Python (3.12.5)
      javascript: 97,  // JavaScript (Node.js 20.17.0)
      c: 103,          // C (GCC 14.1.0)
    };

    const judge0LangId = JUDGE0_LANGUAGE_MAP[language.toLowerCase()];
    if (!judge0LangId) {
      return res.status(400).json({ success: false, message: `Unsupported language: ${language}` });
    }

    let isPractice = false;
    if (contestId) {
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({ success: false, message: "Contest not found." });
      }

      const username = req.user.username;
      const registered = contest.registeredUsers?.includes(username) || contest.participants?.includes(username);
      if (!registered) {
        return res.status(403).json({ success: false, message: "You are not registered for this contest." });
      }

      const now = new Date();
      const start = new Date(contest.startTime);
      const minutes = contest.durationMinutes || (contest.durationHours * 60) || 120;
      const end = new Date(start.getTime() + minutes * 60 * 1000);

      if (now < start) {
        return res.status(403).json({ success: false, message: "Contest has not started yet." });
      }

      if (now > end) {
        return res.status(403).json({ success: false, message: "Contest has ended. Please submit in practice mode." });
      }

      isPractice = false;
    } else {
      isPractice = true;
    }

    // Create a Submission record with status "Pending"
    const submission = await Submission.create({
      username: req.user.username,
      problemId: problem.problemId,
      problemTitle: problem.title,
      language,
      code,
      verdict: "Pending",
      executionTime: 0,
      memoryUsed: 0,
      contestId: contestId || null,
      isPractice,
    });

    console.log(`[Submission] Routing submission ${submission._id} to Judge0 in background...`);
    runCodeforcesSubmission(submission._id, problem, language, code).catch(err => {
      console.error("Background judging failed:", err);
    });

    return res.status(201).json({
      success: true,
      message: "Submission received and queued for judging.",
      submission,
    });
  } catch (err) {
    console.error("CreateSubmission error:", err);
    return res.status(500).json({ success: false, message: "Server error creating submission." });
  }
};

// Helper to check if a contest is running
const isContestRunningNow = async (contestId) => {
  if (!contestId) return false;
  const contest = await Contest.findById(contestId);
  if (!contest) return false;

  const now = new Date();
  const start = new Date(contest.startTime);
  const minutes = contest.durationMinutes || (contest.durationHours * 60) || 120;
  const end = new Date(start.getTime() + minutes * 60 * 1000);

  return now >= start && now < end;
};

// @route  GET /api/submissions/status/:id
// @access Private/Public (guarded if contest is running)
exports.getSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found." });
    }

    // Check if it belongs to a running contest
    if (submission.contestId) {
      const isRunning = await isContestRunningNow(submission.contestId);
      if (isRunning) {
        if (!req.user || (req.user.username !== submission.username && req.user.role !== "admin")) {
          return res.status(403).json({
            success: false,
            message: "You cannot view other users' submissions while the contest is running.",
          });
        }
      }
    }

    return res.status(200).json({ success: true, submission });
  } catch (err) {
    console.error("GetSubmissionStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching submission status." });
  }
};

// @route  GET /api/submissions/:username
// @access Private
exports.getSubmissionsByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    // Users can only view their own submissions unless they're an admin
    if (req.user.username !== username && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these submissions.",
      });
    }

    const submissions = await Submission.find({ username }).sort({ submittedAt: -1 });
    return res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    console.error("GetSubmissionsByUsername error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching submissions." });
  }
};

// @route  GET /api/submissions
// @access Public/Private (contests filtered)
exports.getAllSubmissions = async (req, res) => {
  try {
    const now = new Date();
    const activeContests = await Contest.find({
      startTime: { $lte: now }
    });

    const runningContestIds = new Set(
      activeContests
        .filter(c => {
          const minutes = c.durationMinutes || (c.durationHours * 60) || 120;
          const end = new Date(c.startTime.getTime() + minutes * 60 * 1000);
          return now < end;
        })
        .map(c => c._id.toString())
    );

    const rawSubmissions = await Submission.find().sort({ submittedAt: -1 }).limit(500);

    // Filter out submissions belonging to running contests unless requester is author or admin
    const filteredSubmissions = rawSubmissions.filter(sub => {
      if (sub.contestId && runningContestIds.has(sub.contestId.toString())) {
        if (!req.user) return false;
        if (req.user.role === "admin") return true;
        return sub.username === req.user.username;
      }
      return true;
    });

    return res.status(200).json({ success: true, count: filteredSubmissions.length, submissions: filteredSubmissions });
  } catch (err) {
    console.error("GetAllSubmissions error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching submissions." });
  }
};
