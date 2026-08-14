import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trophy, Clock, Users } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
  Upcoming: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Running: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Ended: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const Contests = () => {
  const { user, isAuthenticated } = useAuth();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(null);
  const [message, setMessage] = useState("");

  const fetchContests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contests");
      setContests(res.data.contests);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const activeContests = contests.filter((c) => c.status !== "Ended");
  const pastContests = contests.filter((c) => c.status === "Ended");

  const renderContestCard = (c) => {
    const isRegistered = user && (c.registeredUsers?.includes(user.username) || c.participants?.includes(user.username));
    return (
      <div
        key={c._id}
        className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center"
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Trophy className="h-5 w-5 text-brand-500" />
            <Link to={`/contests/${c._id}`} className="text-lg font-semibold text-white hover:text-brand-400 transition">
              {c.contestName}
            </Link>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status]}`}>
              {c.status}
            </span>

          </div>
          <p className="mt-1 text-sm text-slate-400">{c.description}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(c.startTime).toLocaleString()} • {c.durationHours}h • {c.type}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {c.participants?.length || 0} registered
            </span>
          </div>
        </div>
        {isRegistered ? (
          <button
            disabled
            className="whitespace-nowrap rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 text-sm font-semibold text-emerald-400 disabled:opacity-100"
          >
            Registered ✓
          </button>
        ) : (
          <button
            onClick={() => handleRegister(c._id)}
            disabled={registering === c._id || c.status === "Ended"}
            className="whitespace-nowrap rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
          >
            {c.status === "Ended" ? "Ended" : registering === c._id ? "Registering..." : "Register"}
          </button>
        )}
      </div>
    );
  };

  const handleRegister = async (id) => {
    if (!isAuthenticated) {
      setMessage("Please log in to register for a contest.");
      return;
    }
    setRegistering(id);
    setMessage("");
    try {
      await api.post(`/contests/${id}/register`);
      setMessage("Successfully registered!");
      fetchContests();
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-white">Contests</h1>
        {isAuthenticated && (
          <Link
            to="/contests/new-proposal"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            + Host Contest
          </Link>
        )}
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm text-brand-300">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <p className="text-center text-rose-400">{error}</p>
      ) : (
        <div className="space-y-10">
          {/* Active and Upcoming Contests */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Active or Upcoming Contests</h2>
            {activeContests.length === 0 ? (
              <p className="text-slate-500 py-2 text-sm">No active or upcoming contests scheduled.</p>
            ) : (
              <div className="space-y-4">
                {activeContests.map(renderContestCard)}
              </div>
            )}
          </div>

          {/* Past Contests */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Past Contests</h2>
            {pastContests.length === 0 ? (
              <p className="text-slate-500 py-2 text-sm">No past contests recorded.</p>
            ) : (
              <div className="space-y-4">
                {pastContests.map(renderContestCard)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Contests;
