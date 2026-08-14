const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");

// Log to file for diagnostics
function logToFile(msg) {
  try {
    const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(path.join(__dirname, "../cf-submitter.log"), logMsg);
  } catch (err) {
    console.error("Failed to write to cf-submitter.log:", err);
  }
  console.log(msg);
}

// Maps frontend languages to Judge0 Language IDs
const JUDGE0_LANGUAGE_MAP = {
  cpp: 105,        // C++ (GCC 14.1.0)
  java: 91,        // Java (JDK 17.0.6)
  python: 100,     // Python (3.12.5)
  javascript: 97,  // JavaScript (Node.js 20.17.0)
  c: 103,          // C (GCC 14.1.0)
};

// Maps Judge0 Status IDs to human-readable verdicts
const MAP_STATUS_ID_TO_VERDICT = {
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error",
  8: "Runtime Error",
  9: "Runtime Error",
  10: "Runtime Error",
  11: "Runtime Error",
  12: "Runtime Error",
  13: "Internal Error",
  14: "Exec Format Error"
};

// Run execution via Judge0 API (via RapidAPI or fallback to direct public host)
async function executeOnJudge0(code, languageId, stdin) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  let url = "https://ce.judge0.com/submissions?wait=true&base64_encoded=false";
  
  if (apiKey) {
    url = `https://${apiHost}/submissions?wait=true&base64_encoded=false`;
    headers["X-RapidAPI-Key"] = apiKey;
    headers["X-RapidAPI-Host"] = apiHost;
  }
  
  const response = await axios.post(url, {
    source_code: code,
    language_id: languageId,
    stdin: stdin || "",
  }, { headers, timeout: 10000 });
  
  return response.data;
}

// Background runner for all submissions using Judge0
async function runCodeforcesSubmission(submissionId, problem, language, code) {
  const submission = await Submission.findById(submissionId);
  if (!submission) return;

  logToFile(`[Judge0 Submitter] Starting Judge0 execution for submission ${submissionId} (Problem: ${problem.problemId})...`);

  try {
    const judge0LangId = JUDGE0_LANGUAGE_MAP[language.toLowerCase()];
    if (!judge0LangId) {
      throw new Error(`Unsupported Judge0 language: ${language}`);
    }

    // 1. Fetch the corresponding Problem from MongoDB to retrieve its testCases
    const fullProblem = await Problem.findById(problem._id);
    if (!fullProblem) {
      throw new Error("Problem not found in database.");
    }

    // Use testCases if defined, fall back to examples
    const testCases = (fullProblem.testCases && fullProblem.testCases.length > 0)
      ? fullProblem.testCases
      : fullProblem.examples.map(ex => ({ input: ex.input, expectedOutput: ex.output }));

    if (testCases.length === 0) {
      throw new Error("No test cases or examples configured for this problem.");
    }

    logToFile(`[Judge0 Submitter] Found ${testCases.length} test cases to evaluate...`);

    let finalVerdict = "Accepted";
    let maxExecutionTime = 0;
    let maxMemoryUsed = 0;

    // Run test cases sequentially
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      logToFile(`[Judge0 Submitter] Running test case ${i + 1}/${testCases.length}...`);
      
      const stdinData = tc.input || "";
      const expectedOutData = (tc.expectedOutput || tc.output || "").trim();
      
      const result = await executeOnJudge0(code, judge0LangId, stdinData);
      
      const statusId = result.status?.id;
      const stdout = (result.stdout || "").trim();
      const stderr = result.stderr || "";
      const compileOutput = result.compile_output || "";
      
      // Log execution metrics
      const timeMs = parseFloat(result.time || 0) * 1000;
      const memKb = parseInt(result.memory || 0);
      maxExecutionTime = Math.max(maxExecutionTime, timeMs);
      maxMemoryUsed = Math.max(maxMemoryUsed, memKb);

      logToFile(`[Test Case ${i + 1}] Status ID: ${statusId} | Time: ${timeMs}ms | Memory: ${memKb}KB`);

      // Check compilation error first
      if (statusId === 6) {
        finalVerdict = "Compilation Error";
        logToFile(`[Test Case ${i + 1}] Compilation Error:\n${compileOutput}`);
        break;
      }
      
      // Check timeout
      if (statusId === 5) {
        finalVerdict = "Time Limit Exceeded";
        break;
      }

      // Check runtime errors
      if (statusId > 6) {
        finalVerdict = "Runtime Error";
        logToFile(`[Test Case ${i + 1}] Runtime Error:\n${stderr}`);
        break;
      }

      // Compare stdout with expected output
      if (stdout !== expectedOutData) {
        finalVerdict = "Wrong Answer";
        logToFile(`[Test Case ${i + 1}] Output mismatch.\nExpected:\n"${expectedOutData}"\nGot:\n"${stdout}"`);
        break;
      }
    }

    // Save final result
    submission.verdict = finalVerdict;
    submission.executionTime = maxExecutionTime;
    submission.memoryUsed = maxMemoryUsed;
    await submission.save();

    logToFile(`[Judge0 Submitter] Judging completed for ${submissionId}: ${finalVerdict}`);
    await updateStats(submission, fullProblem, finalVerdict);

  } catch (err) {
    logToFile(`[Judge0 Submitter] Error during judging of ${submissionId}: ${err.message}\nStack: ${err.stack}`);
    submission.verdict = "Submission Error";
    await submission.save();
  }
}

// Problem stats updater
async function updateStats(submission, problem, verdict) {
  problem.totalSubmissions += 1;
  if (verdict === "Accepted") problem.totalAccepted += 1;
  await problem.save();

  if (verdict === "Accepted") {
    const user = await User.findOne({ username: submission.username });
    if (user && !user.solvedProblems.includes(problem.problemId)) {
      user.solvedProblems.push(problem.problemId);
      await user.save();
    }
  }
}

module.exports = {
  runCodeforcesSubmission,
  updateStats
};
