import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import CodeViewerModal from "./CodeViewerModal";

/**
 * Format date/timestamp to match Codeforces format: "Aug/11/2026 07:13UTC+6"
 */
const formatDate = (dateInput) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  const offsetMinutes = d.getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? "+" : "-";
  const absOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = Math.floor(absOffsetMinutes / 60);
  const offsetMinsRemaining = absOffsetMinutes % 60;

  const tzString = `UTC${sign}${offsetHours}${offsetMinsRemaining > 0 ? `:${offsetMinsRemaining.toString().padStart(2, "0")}` : ""
    }`;

  return `${month}/${day}/${year} ${hours}:${minutes}${tzString}`;
};

/**
 * Get Codeforces rating color classes
 */
const getCodeforcesRatingClass = (rating) => {
  if (rating === undefined || rating === null) {
    return "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium";
  }
  if (rating < 1200) return "text-gray-500 dark:text-gray-400 font-medium"; // Newbie
  if (rating < 1400) return "text-green-600 dark:text-green-400 font-medium"; // Pupil
  if (rating < 1600) return "text-cyan-600 dark:text-cyan-400 font-medium"; // Specialist
  if (rating < 1900) return "text-blue-600 dark:text-blue-400 font-semibold"; // Expert
  if (rating < 2200) return "text-violet-600 dark:text-violet-400 font-semibold"; // Candidate Master
  if (rating < 2400) return "text-orange-500 font-semibold"; // Master / International Master
  return "text-red-500 font-bold"; // Grandmaster / Legendary Grandmaster
};

/**
 * Verdict conditional styling
 */
const getVerdictStyle = (verdict) => {
  if (!verdict) return "text-slate-400 dark:text-slate-500";
  const lower = verdict.toLowerCase();

  // Green: Passed all tests
  if (lower.startsWith("accepted")) {
    return "text-green-600 dark:text-emerald-400 font-bold";
  }

  // Blue / Dark Blue: Running/Testing
  if (
    lower.startsWith("running") ||
    lower.includes("testing") ||
    lower.includes("in queue") ||
    lower.includes("queue") ||
    lower.includes("pending")
  ) {
    return "text-blue-600 dark:text-blue-400 font-semibold italic animate-pulse";
  }

  // Orange / Yellow: Compilation error, warning
  if (lower.includes("compilation error") || lower.includes("compile") || lower.includes("warning")) {
    return "text-amber-500 dark:text-amber-400 font-bold";
  }

  // Red: Failed/Error (Wrong answer, Runtime error, Time Limit Exceeded, Memory Limit Exceeded, etc.)
  return "text-red-600 dark:text-red-400 font-bold";
};

const StatusTable = ({
  submissions = [],
  isContestRunning = false,
  currentUsername = null,
  friends = [],
  userRatings = {},
  getUserRatingColor = null,
  onSubmissionClick = null,
}) => {
  const [myOnly, setMyOnly] = useState(false);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Helper to extract rating color and classes
  const getWhoFieldStyle = (username, submission) => {
    if (typeof getUserRatingColor === "function") {
      return getUserRatingColor(username, submission);
    }
    const rating =
      submission?.rating ??
      submission?.userRating ??
      userRatings?.[username] ??
      null;

    return getCodeforcesRatingClass(rating);
  };

  const renderWhoLink = (username, submission) => {
    const rating =
      submission?.rating ??
      submission?.userRating ??
      userRatings?.[username] ??
      null;

    const ratingClass = getWhoFieldStyle(username, submission);

    // Codeforces Legendary Grandmaster special handling: first letter black/white, rest red
    if (rating !== null && rating >= 3000) {
      const firstChar = username.charAt(0);
      const restOfName = username.slice(1);
      return (
        <Link
          to={`/profile/${username}`}
          className="font-bold text-red-500 hover:underline"
          title={`Rating: ${rating}`}
        >
          <span className="text-slate-800 dark:text-slate-100">{firstChar}</span>
          {restOfName}
        </Link>
      );
    }

    return (
      <Link
        to={`/profile/${username}`}
        className={`${ratingClass} hover:underline`}
        title={rating !== null ? `Rating: ${rating}` : undefined}
      >
        {username}
      </Link>
    );
  };

  const handleRowOrIdClick = (e, submission) => {
    e.preventDefault();
    if (typeof onSubmissionClick === "function") {
      onSubmissionClick(submission);
    } else {
      setSelectedSubmission(submission);
    }
  };

  // Filter & Search Logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. If contest is running, only show current user's submissions
      if (isContestRunning && sub.username !== currentUsername) {
        return false;
      }

      // 2. "my only" checkbox filter
      if (myOnly && sub.username !== currentUsername) {
        return false;
      }

      // 3. "friends only" checkbox filter
      if (friendsOnly && (!friends || !friends.includes(sub.username))) {
        return false;
      }

      // 4. Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const subId = String(sub._id || "").toLowerCase();
        const username = String(sub.username || "").toLowerCase();

        // Handle problem object or direct properties
        const probId = String(sub.problem?.id ?? sub.problemId ?? "").toLowerCase();
        const probTitle = String(sub.problem?.title ?? sub.problemTitle ?? "").toLowerCase();

        const lang = String(sub.language || "").toLowerCase();
        const verdict = String(sub.verdict || "").toLowerCase();

        const matches =
          subId.includes(term) ||
          username.includes(term) ||
          probId.includes(term) ||
          probTitle.includes(term) ||
          lang.includes(term) ||
          verdict.includes(term);

        if (!matches) return false;
      }

      return true;
    });
  }, [submissions, isContestRunning, currentUsername, myOnly, friendsOnly, friends, searchTerm]);

  return (
    <div className="w-full font-sans">
      {/* Control Bar (Aligned to the Right) */}
      <div className="mb-4 flex flex-wrap items-center justify-end gap-5">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-100 transition">
            <input
              type="checkbox"
              checked={myOnly}
              onChange={(e) => setMyOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-750 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900"
            />
            <span className="text-slate-300">my only</span>
          </label>

          <label
            className={`flex items-center gap-1.5 cursor-pointer select-none transition ${!friends || friends.length === 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:text-slate-100"
              }`}
          >
            <input
              type="checkbox"
              checked={friendsOnly}
              disabled={!friends || friends.length === 0}
              onChange={(e) => setFriendsOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-750 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-900 disabled:opacity-50"
            />
            <span className="text-slate-300">friends only</span>
          </label>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-44 rounded-md border border-slate-700 bg-slate-800 pl-8 pr-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Dense Data Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 shadow-sm bg-slate-900 transition-colors">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs text-slate-300 font-medium">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/80 font-semibold text-slate-300 select-none">
              <th className="py-2.5 px-3 border-r border-slate-700 w-24">#</th>
              <th className="py-2.5 px-3 border-r border-slate-700 w-44">When</th>
              <th className="py-2.5 px-3 border-r border-slate-700 w-36">Who</th>
              <th className="py-2.5 px-3 border-r border-slate-700">Problem</th>
              <th className="py-2.5 px-3 border-r border-slate-700 w-28">Lang</th>
              <th className="py-2.5 px-3 border-r border-slate-700 w-60">Verdict</th>
              <th className="py-2.5 px-3 border-r border-slate-700 w-20">Time</th>
              <th className="py-2.5 px-3 w-24">Memory</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-slate-400 bg-slate-800/20"
                >
                  No submissions found matching criteria.
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((sub, index) => {
                const problemId = sub.problem?.id ?? sub.problemId ?? "";
                const problemTitle = sub.problem?.title ?? sub.problemTitle ?? "";
                const combinedProblemName = problemId
                  ? `${problemId} - ${problemTitle}`
                  : problemTitle;

                return (
                  <tr
                    key={sub._id || index}
                    className="border-b border-slate-800 odd:bg-slate-900 even:bg-slate-950 hover:bg-slate-800/40 transition"
                  >
                    {/* Submission ID */}
                    <td className="py-1.5 px-3 border-r border-slate-800 font-mono text-slate-400">
                      <a
                        href={`#submission-${sub._id}`}
                        onClick={(e) => handleRowOrIdClick(e, sub)}
                        className="text-brand-500 hover:text-brand-400 hover:underline font-semibold"
                      >
                        {sub._id}
                      </a>
                    </td>

                    {/* Timestamp */}
                    <td className="py-1.5 px-3 border-r border-slate-800 text-[10.5px] text-slate-400 whitespace-nowrap">
                      {formatDate(sub.submittedAt)}
                    </td>

                    {/* Username */}
                    <td className="py-1.5 px-3 border-r border-slate-800 font-semibold truncate max-w-[150px]">
                      {renderWhoLink(sub.username, sub)}
                    </td>

                    {/* Problem */}
                    <td className="py-1.5 px-3 border-r border-slate-800 truncate max-w-[280px]">
                      <Link
                        to={`/problems/${problemId}${sub.contestId ? `?contestId=${sub.contestId}` : ""
                          }`}
                        className="text-brand-500 hover:text-brand-400 hover:underline font-medium"
                      >
                        {combinedProblemName}
                      </Link>
                    </td>

                    {/* Language */}
                    <td className="py-1.5 px-3 border-r border-slate-800 text-slate-300">
                      {sub.language}
                    </td>

                    {/* Verdict */}
                    <td
                      className={`py-1.5 px-3 border-r border-slate-800 ${getVerdictStyle(
                        sub.verdict
                      )}`}
                    >
                      {sub.verdict}
                    </td>

                    {/* Time */}
                    <td className="py-1.5 px-3 border-r border-slate-800 text-slate-400 text-right font-mono">
                      {sub.executionTime ?? 0} ms
                    </td>

                    {/* Memory */}
                    <td className="py-1.5 px-3 text-slate-400 text-right font-mono">
                      {sub.memoryUsed ?? 0} KB
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Internal Code Viewer Modal fallback */}
      {selectedSubmission && !onSubmissionClick && (
        <CodeViewerModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
};

export default StatusTable;
