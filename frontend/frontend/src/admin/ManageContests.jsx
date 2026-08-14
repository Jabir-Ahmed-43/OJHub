import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2, CheckCircle2, XCircle, Trophy, Clock } from "lucide-react";
import api from "../api/axios";

const APPROVAL_STYLES = {
  Approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Rejected: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

const ManageContests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

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

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/contests/${id}`, { approvalStatus: "Approved" });
      setContests((prev) =>
        prev.map((c) => (c._id === id ? { ...c, approvalStatus: "Approved" } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve contest.");
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/contests/${id}`, { approvalStatus: "Rejected" });
      setContests((prev) =>
        prev.map((c) => (c._id === id ? { ...c, approvalStatus: "Rejected" } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject contest.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (contest) => {
    if (!confirm(`Delete contest "${contest.contestName}"? This cannot be undone.`)) return;
    setActioningId(contest._id);
    try {
      await api.delete(`/contests/${contest._id}`);
      setContests((prev) => prev.filter((c) => c._id !== contest._id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete contest.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Contests</h1>
        <Link
          to="/admin/contests/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          + Create Contest
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : error ? (
          <p className="py-16 text-center text-rose-400">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <th className="px-5 py-3">Contest Name</th>
                  <th className="px-5 py-3">Creator</th>
                  <th className="px-5 py-3">Scheduled Start</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Approval</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No contests found.
                    </td>
                  </tr>
                )}
                {contests.map((c) => (
                  <tr key={c._id} className="border-b border-slate-800/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-brand-500" />
                        <Link to={`/contests/${c._id}`} className="font-medium text-white hover:underline">
                          {c.contestName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{c.createdBy || "admin"}</td>
                    <td className="px-5 py-3 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {new Date(c.startTime).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-300">{c.durationHours} hours</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          APPROVAL_STYLES[c.approvalStatus || "Approved"]
                        }`}
                      >
                        {c.approvalStatus || "Approved"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {(c.approvalStatus === "Pending" || c.approvalStatus === "Rejected") && (
                          <button
                            disabled={actioningId === c._id}
                            onClick={() => handleApprove(c._id)}
                            title="Approve"
                            className="rounded-lg border border-slate-700 p-1.5 text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {(c.approvalStatus === "Pending" || c.approvalStatus === "Approved") && (
                          <button
                            disabled={actioningId === c._id}
                            onClick={() => handleReject(c._id)}
                            title="Reject"
                            className="rounded-lg border border-slate-700 p-1.5 text-rose-400 transition hover:border-rose-500 hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          disabled={actioningId === c._id}
                          onClick={() => handleDelete(c)}
                          title="Delete"
                          className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-rose-500 hover:text-rose-400 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageContests;
