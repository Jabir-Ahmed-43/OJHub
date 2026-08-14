import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api/axios";

const HostContest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contestName: "",
    startTime: "",
    durationHours: 2,
    type: "ICPC",
    isRated: true,
    description: "",
  });
  const [allProblems, setAllProblems] = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get("/problems", { params: { status: "Published" } });
        setAllProblems(res.data.problems);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblems();
  }, []);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleProblem = (id) => {
    setSelectedProblems((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.contestName || !form.startTime || !form.durationHours) {
      setError("Contest name, start time, and duration are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/contests", {
        ...form,
        durationHours: Number(form.durationHours),
        startTime: new Date(form.startTime).toISOString(),
        problems: selectedProblems,
      });
      setSuccess(`Contest "${res.data.contest.contestName}" proposed successfully! Waiting for admin approval.`);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to propose contest.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-300";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-white">Host New Contest</h1>
      <p className="mb-6 text-sm text-slate-400">
        Submit a contest proposal. An admin will review and approve it to schedule it.
      </p>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Contest Name *</label>
            <input
              type="text"
              value={form.contestName}
              onChange={(e) => handleChange("contestName", e.target.value)}
              placeholder="OJHub Weekly Round #1"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Start Time *</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Duration (hours) *</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={form.durationHours}
              onChange={(e) => handleChange("durationHours", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select value={form.type} onChange={(e) => handleChange("type", e.target.value)} className={inputClass}>
              <option>ICPC</option>
              <option>IOI</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.isRated}
                onChange={(e) => handleChange("isRated", e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand-600"
              />
              Rated Contest
            </label>
          </div>
          <div>
            <label className={labelClass}>Approval Status</label>
            <div className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-sm text-amber-400 font-semibold">
              Pending Approval (Locked)
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Select Problems ({selectedProblems.length} selected)</label>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-800 p-2">
            {allProblems.length === 0 && (
              <p className="p-3 text-sm text-slate-500">No published problems available yet.</p>
            )}
            {allProblems.map((p) => (
              <label
                key={p._id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-800"
              >
                <input
                  type="checkbox"
                  checked={selectedProblems.includes(p._id)}
                  onChange={() => toggleProblem(p._id)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand-600"
                />
                <span className="font-mono text-slate-500">{p.problemId}</span>
                <span className="text-slate-200">{p.title}</span>
                <span className="ml-auto text-xs text-slate-500">{p.difficulty}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Proposal
        </button>
      </form>
    </div>
  );
};

export default HostContest;
