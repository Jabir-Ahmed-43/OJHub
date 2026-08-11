import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Loader2, Send, Clock, MemoryStick, AlertCircle } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const LANGUAGES = [
  { value: "cpp", label: "C++17" },
  { value: "java", label: "Java 17" },
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript (Node)" },
  { value: "c", label: "C" },
];
const getVerdictColor = (verdict) => {
  switch (verdict) {
    case "Accepted":
      return "text-emerald-600 dark:text-emerald-400";
    case "Wrong Answer":
      return "text-rose-600 dark:text-rose-400";
    case "Time Limit Exceeded":
    case "Memory Limit Exceeded":
      return "text-amber-600 dark:text-amber-400";
    case "Runtime Error":
      return "text-orange-600 dark:text-orange-400";
    case "Compilation Error":
      return "text-slate-500 dark:text-slate-400";
    case "Pending":
      return "text-blue-600 dark:text-blue-400 animate-pulse";
    default:
      return "text-rose-600 dark:text-rose-400";
  }
};

const DEFAULT_SNIPPETS = {
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
  python: '# Write your solution here\n',
  javascript: '// Write your solution here\n',
  c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
};

const difficultyBadge = (difficulty) => {
  const map = { Easy: "difficulty-Easy", Medium: "difficulty-Medium", Hard: "difficulty-Hard" };
  return `inline-block rounded-full border px-3 py-1 text-xs font-semibold ${map[difficulty]}`;
};

const ProblemDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contestId");

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(DEFAULT_SNIPPETS.cpp);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [pollingIntervalId, setPollingIntervalId] = useState(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalId) clearInterval(pollingIntervalId);
    };
  }, [pollingIntervalId]);

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/problems/${id}`);
        setProblem(res.data.problem);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_SNIPPETS[lang]);
  };

  const startPolling = (submissionId) => {
    if (pollingIntervalId) clearInterval(pollingIntervalId);
    const intervalId = setInterval(async () => {
      try {
        const res = await api.get(`/submissions/status/${submissionId}`);
        const sub = res.data.submission;
        setResult(sub);
        if (sub.verdict !== "Pending") {
          clearInterval(intervalId);
          setPollingIntervalId(null);
        }
      } catch (err) {
        console.error("Error polling submission status:", err);
        clearInterval(intervalId);
        setPollingIntervalId(null);
      }
    }, 2000);
    setPollingIntervalId(intervalId);
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setResult(null);
    if (!isAuthenticated) {
      setSubmitError("Please log in to submit a solution.");
      return;
    }
    if (!code.trim()) {
      setSubmitError("Code cannot be empty.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/submissions", {
        problemId: problem.problemId,
        language,
        code,
        contestId: contestId || undefined,
      });
      const sub = res.data.submission;
      setResult(sub);
      if (sub.verdict === "Pending") {
        startPolling(sub._id);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="p-8 text-center text-rose-400">
        {error || "Problem not found."}
        <div className="mt-4">
          <Link to="/problems" className="text-brand-400 hover:underline">
            Back to problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:h-[calc(100vh-64px)] lg:grid-cols-2 lg:overflow-hidden lg:py-4">
      {/* Statement */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-6 lg:h-full lg:overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            {problem.problemId}. {problem.title}
          </h1>
          <span className={difficultyBadge(problem.difficulty)}>{problem.difficulty}</span>
        </div>

        <div className="mb-4 flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {problem.timeLimit}s
          </span>
          <span className="flex items-center gap-1">
            <MemoryStick className="h-3.5 w-3.5" /> {problem.memoryLimit} MB
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {(problem.tags || []).map((t) => (
            <span key={t} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
              {t}
            </span>
          ))}
        </div>

        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300">
          {problem.problemStatement}
        </div>

        {problem.inputFormat && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-white">Input Format</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{problem.inputFormat}</p>
          </div>
        )}
        {problem.outputFormat && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-white">Output Format</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{problem.outputFormat}</p>
          </div>
        )}
        {problem.constraints && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-white">Constraints</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-300">{problem.constraints}</p>
          </div>
        )}

        {(problem.examples || []).map((ex, i) => (
          <div key={i} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Sample Input {i + 1}</h4>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">{ex.input}</pre>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Sample Output {i + 1}</h4>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">{ex.output}</pre>
            </div>
            {ex.explanation && (
              <div className="sm:col-span-2">
                <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Explanation</h4>
                <p className="text-xs text-slate-400">{ex.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 lg:h-full lg:overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white outline-none focus:border-brand-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit
          </button>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="min-h-[420px] flex-1 resize-none bg-slate-950 p-4 font-mono text-sm text-slate-200 outline-none lg:min-h-0 lg:overflow-y-auto"
        />

        <div className="border-t border-slate-800 p-4">
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
          {result && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <p className={`text-lg font-bold ${getVerdictColor(result.verdict)}`}>
                {result.verdict === "Pending" ? "Judging..." : result.verdict}
              </p>
              {result.verdict !== "Pending" && (
                <p className="mt-1 text-xs text-slate-400">
                  Runtime: {result.executionTime} ms &nbsp;|&nbsp; Memory: {result.memoryUsed} KB
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
