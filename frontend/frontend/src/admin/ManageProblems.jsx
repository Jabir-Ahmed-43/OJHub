import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Trash2, Pencil, Eye } from "lucide-react";
import api from "../api/axios";

const STATUS_STYLES = {
  Published: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Pending: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Draft: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Archived: "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const ManageProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/problems");
      setProblems(res.data.problems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load problems.");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchProblems();
  }, []);

  const toggleStatus = async (p) => {
    setActioningId(p._id);
    try {
      const newStatus = p.status === "Published" ? "Draft" : "Published";
      await api.put(`/problems/${p._id}`, { status: newStatus });
      setProblems((prev) => prev.map((pr) => (pr._id === p._id ? { ...pr, status: newStatus } : pr)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete problem "${p.title}"? This cannot be undone.`)) return;
    setActioningId(p._id);
    try {
      await api.delete(`/problems/${p._id}`);
      setProblems((prev) => prev.filter((pr) => pr._id !== p._id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete problem.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Problems</h1>
        <Link
          to="/admin/problems/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          + Add Problem
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
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Difficulty</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Submissions</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No problems yet.
                    </td>
                  </tr>
                )}
                {problems.map((p) => (
                  <tr key={p._id} className="border-b border-slate-800/60">
                    <td className="px-5 py-3 font-mono text-slate-400">{p.problemId}</td>
                    <td className="px-5 py-3 font-medium text-white">{p.title}</td>
                    <td className="px-5 py-3 text-slate-300">{p.difficulty}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">{p.totalSubmissions}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/problems/${p.problemId}`}
                          className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-brand-500 hover:text-brand-400"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          disabled={actioningId === p._id}
                          onClick={() => toggleStatus(p)}
                          title={p.status === "Published" ? "Unpublish" : "Publish"}
                          className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-amber-500 hover:text-amber-400 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          disabled={actioningId === p._id}
                          onClick={() => handleDelete(p)}
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

export default ManageProblems;
