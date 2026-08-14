import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, Trophy, Clock, Users, Calendar, Award, CheckCircle2, XCircle, UserCheck, Edit, X } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ContestTimer from "../components/ContestTimer";

const STATUS_STYLES = {
  Upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Running: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Ended: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const ContestDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState("problems"); // 'problems' | 'scoreboard' | 'registered'

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    contestName: "",
    description: "",
    startTime: "",
    durationMinutes: 120,
    type: "ICPC",
    isRated: true,
  });

  const fetchContest = async () => {
    try {
      const res = await api.get(`/contests/${id}`);
      setContest(res.data.contest);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contest details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
    // Refresh scoreboard every 20 seconds if running
    const interval = setInterval(() => {
      if (contest && contest.status === "Running") {
        fetchContest();
      }
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, contest?.status]);

  useEffect(() => {
    if (contest) {
      if (contest.status === "Upcoming") {
        setActiveTab("registered");
      } else {
        setActiveTab("problems");
      }
    }
  }, [contest?.status]);

  const handleRegister = async () => {
    if (!isAuthenticated) return;
    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register`);
      await fetchContest();
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(false);
    }
  };

  const isRegistered = useMemo(() => {
    if (!contest || !user) return false;
    return contest.registeredUsers?.includes(user.username) || contest.participants?.includes(user.username);
  }, [contest, user]);

  const handleTimerExpire = () => {
    fetchContest();
  };

  const openEditModal = () => {
    let formattedStart = "";
    if (contest.startTime) {
      const d = new Date(contest.startTime);
      const tzOffset = d.getTimezoneOffset() * 60000;
      formattedStart = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    }

    setEditForm({
      contestName: contest.contestName || "",
      description: contest.description || "",
      startTime: formattedStart,
      durationMinutes: contest.durationMinutes || (contest.durationHours * 60) || 120,
      type: contest.type || "ICPC",
      isRated: contest.isRated ?? true,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/contests/${contest._id}`, editForm);
      setShowEditModal(false);
      fetchContest();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update contest structure.");
    } finally {
      setUpdating(false);
    }
  };

  // Calculate ACM/ICPC style leaderboard
  const leaderboard = useMemo(() => {
    if (!contest) return [];

    const startTime = new Date(contest.startTime).getTime();
    const scoreboard = {};

    // Initialize all registered participants
    const participantsList = contest.registeredUsers || contest.participants || [];
    participantsList.forEach((username) => {
      scoreboard[username] = {
        username,
        solved: new Set(),
        penalty: 0,
        problemStats: {}, // problemId -> { solved: false, attempts: 0 }
      };
    });

    // Chronologically process contest submissions
    (contest.submissions || []).forEach((sub) => {
      const username = sub.username;

      if (!scoreboard[username]) {
        scoreboard[username] = {
          username,
          solved: new Set(),
          penalty: 0,
          problemStats: {},
        };
      }

      const pId = sub.problemId;
      if (!scoreboard[username].problemStats[pId]) {
        scoreboard[username].problemStats[pId] = { solved: false, attempts: 0 };
      }

      const stats = scoreboard[username].problemStats[pId];

      if (stats.solved) return;

      const subTime = new Date(sub.submittedAt).getTime();
      const minutesSinceStart = Math.floor((subTime - startTime) / 60000);

      if (sub.verdict === "Accepted") {
        stats.solved = true;
        stats.solveTime = minutesSinceStart;
        scoreboard[username].solved.add(pId);
        scoreboard[username].penalty += minutesSinceStart + stats.attempts * 20;
      } else {
        stats.attempts += 1;
      }
    });

    return Object.values(scoreboard)
      .map((row) => ({
        ...row,
        solvedCount: row.solved.size,
      }))
      .sort((a, b) => {
        if (b.solvedCount !== a.solvedCount) {
          return b.solvedCount - a.solvedCount;
        }
        return a.penalty - b.penalty;
      });
  }, [contest]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="p-8 text-center text-rose-400">
        {error || "Contest not found."}
        <div className="mt-4">
          <Link to="/contests" className="text-brand-400 hover:underline">
            Back to contests
          </Link>
        </div>
      </div>
    );
  }

  const contestEnded = contest.status === "Ended";
  const contestUpcoming = contest.status === "Upcoming";
  const showContent = !contestUpcoming || contestEnded;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header Panel */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[contest.status]}`}>
                {contest.status}
              </span>
              {contest.isRated && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  Rated Contest
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">{contest.contestName}</h1>
            <p className="mt-2 text-sm text-slate-400">{contest.description}</p>
          </div>

          <div className="flex flex-col items-stretch gap-2.5 min-w-[200px]">
            <ContestTimer
              startTime={contest.startTime}
              durationMinutes={contest.durationMinutes || (contest.durationHours * 60) || 120}
              onExpire={handleTimerExpire}
            />

            <div className="flex gap-2">
              {!isRegistered && !contestEnded && (
                <button
                  onClick={handleRegister}
                  disabled={registering || !isAuthenticated}
                  className="flex-1 rounded-lg bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
                >
                  {!isAuthenticated
                    ? "Log in to Register"
                    : registering
                      ? "Registering..."
                      : "Register Now"}
                </button>
              )}
              {isRegistered && !contestEnded && (
                <div className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-5 py-2.5 text-center text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                  <UserCheck className="h-4 w-4" /> Registered ✓
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={openEditModal}
                  className="rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  title="Edit Contest Structure"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6 sm:grid-cols-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-500">Start Time</p>
              <p className="font-semibold text-slate-300">
                {new Date(contest.startTime).toLocaleDateString()}{" "}
                {new Date(contest.startTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="font-semibold text-slate-300">
                {contest.durationMinutes || (contest.durationHours * 60) || 120} min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-500">Format</p>
              <p className="font-semibold text-slate-300">{contest.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-xs text-slate-500">Registered</p>
              <p className="font-semibold text-slate-300">
                {(contest.registeredUsers || contest.participants || []).length} participants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="space-y-6 ">
        <div className="border-b border-slate-800">
          <nav className="flex items-center justify-center gap-4">
            {showContent && (
              <>
                <button
                  onClick={() => setActiveTab("problems")}
                  className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${activeTab === "problems"
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent text-slate-400 hover:text-white"
                    }`}
                >
                  Problems
                </button>
                <button
                  onClick={() => setActiveTab("scoreboard")}
                  className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${activeTab === "scoreboard"
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent text-slate-400 hover:text-white"
                    }`}
                >
                  Standings
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab("registered")}
              className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${activeTab === "registered"
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-slate-400 hover:text-white"
                }`}
            >
              Registered Users
            </button>
          </nav>
        </div>

        {/* Active Tab Panel */}
        {activeTab === "problems" && (
          <div className="space-y-6">
            {contestEnded && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
                <strong>Solve in Practice Mode:</strong> This contest has ended. You can still solve the problems and submit solutions in practice mode. Submissions will not affect the official contest standings.
              </div>
            )}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                    <th className="w-16 px-6 py-3">#</th>
                    <th className="w-28 px-6 py-3">ID</th>
                    <th className="px-6 py-3">Title</th>
                    <th className="w-32 px-6 py-3 text-right">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {(contest.problems || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No problems have been added to this contest yet.
                      </td>
                    </tr>
                  ) : (
                    (contest.problems || []).map((p, idx) => (
                      <tr key={p._id} className="border-b border-slate-800/60 transition hover:bg-slate-800/40">
                        <td className="px-6 py-4 font-mono font-bold text-brand-400">
                          {String.fromCharCode(65 + idx)}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400">{p.problemId}</td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/problems/${p.problemId}?contestId=${contest._id}`}
                            className="font-semibold text-white hover:text-brand-400"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${p.difficulty === "Easy"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : p.difficulty === "Medium"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                              }`}
                          >
                            {p.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "scoreboard" && (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                    <th className="w-16 px-6 py-3 text-center">Rank</th>
                    <th className="px-6 py-3">Competitor</th>
                    <th className="w-28 px-6 py-3 text-center">Solved</th>
                    <th className="w-28 px-6 py-3 text-center">Penalty</th>
                    {(contest.problems || []).map((_, idx) => (
                      <th key={idx} className="w-20 px-4 py-3 text-center">
                        {String.fromCharCode(65 + idx)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4 + (contest.problems || []).length} className="px-6 py-12 text-center text-slate-500">
                        No users registered or no submissions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((row, idx) => (
                      <tr key={row.username} className="border-b border-slate-800/60 transition hover:bg-slate-800/40">
                        <td className="px-6 py-4 text-center font-bold text-slate-300">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/profile/${row.username}`} className="font-semibold text-white hover:text-brand-400">
                            {row.username}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-brand-400">
                          {row.solvedCount}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-400 font-mono">
                          {row.penalty}
                        </td>
                        {(contest.problems || []).map((p) => {
                          const stat = row.problemStats[p.problemId];
                          if (!stat) {
                            return <td key={p.problemId} className="px-4 py-4 text-center text-slate-700">-</td>;
                          }
                          if (stat.solved) {
                            return (
                              <td key={p.problemId} className="px-4 py-4 text-center bg-emerald-500/10 text-emerald-400 font-semibold font-mono">
                                <div className="flex flex-col items-center">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span className="text-[10px] mt-0.5">{stat.solveTime}m</span>
                                  {stat.attempts > 0 && <span className="text-[9px] text-emerald-500/70">+{stat.attempts}</span>}
                                </div>
                              </td>
                            );
                          }
                          return (
                            <td key={p.problemId} className="px-4 py-4 text-center bg-rose-500/10 text-rose-400 font-mono text-xs">
                              <div className="flex flex-col items-center">
                                <XCircle className="h-3.5 w-3.5" />
                                <span className="text-[10px] mt-0.5">-{stat.attempts}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "registered" && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Registered Competitors</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(contest.registeredUsers || contest.participants || []).length === 0 ? (
                <p className="col-span-full text-center text-slate-500 py-6">No participants registered yet.</p>
              ) : (
                (contest.registeredUsers || contest.participants || []).map((username) => (
                  <div
                    key={username}
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                  >
                    <div className="h-2 w-2 rounded-full bg-brand-500" />
                    <span className="truncate font-medium">{username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Structure Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-500" /> Edit Contest Structure
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Contest Name</label>
                <input
                  type="text"
                  required
                  value={editForm.contestName}
                  onChange={(e) => setEditForm({ ...editForm, contestName: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editForm.durationMinutes}
                    onChange={(e) => setEditForm({ ...editForm, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">Format</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="ICPC">ACM/ICPC</option>
                    <option value="IOI">IOI</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit-isRated"
                    checked={editForm.isRated}
                    onChange={(e) => setEditForm({ ...editForm, isRated: e.target.checked })}
                    className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-brand-500 focus:ring-brand-500"
                  />
                  <label htmlFor="edit-isRated" className="text-sm font-medium text-slate-300 select-none">
                    Rated Contest
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestDetail;
