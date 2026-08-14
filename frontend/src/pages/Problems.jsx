import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, CheckCircle2, Loader2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const difficultyBadge = (difficulty) => {
  const map = {
    Easy: "difficulty-Easy",
    Medium: "difficulty-Medium",
    Hard: "difficulty-Hard",
  };
  return `inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[difficulty]}`;
};

const Problems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [tag, setTag] = useState("All");

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const res = await api.get("/problems", { params: { status: "Published" } });
        setProblems(res.data.problems);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load problems.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    problems.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(t)));
    return ["All", ...Array.from(tagSet).sort()];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.problemId.toLowerCase().includes(search.toLowerCase());
      const matchesDifficulty = difficulty === "All" || p.difficulty === difficulty;
      const matchesTag = tag === "All" || (p.tags || []).includes(tag);
      return matchesSearch && matchesDifficulty && matchesTag;
    });
  }, [problems, search, difficulty, tag]);

  const isSolved = (problemId) => user?.solvedProblems?.includes(problemId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Problem Set</h1>
          <p className="mt-1 text-sm text-slate-400">
            {filteredProblems.length} of {problems.length} problems
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or ID..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
          >
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Tags" : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <th className="w-10 px-5 py-3"></th>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Difficulty</th>
                  <th className="px-5 py-3">Tags</th>
                  <th className="px-5 py-3">Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                      No problems match your filters.
                    </td>
                  </tr>
                )}
                {filteredProblems.map((p) => {
                  const acceptance =
                    p.totalSubmissions > 0
                      ? ((p.totalAccepted / p.totalSubmissions) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <tr key={p._id} className="border-b border-slate-800/60 transition hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        {isSolved(p.problemId) && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-400">{p.problemId}</td>
                      <td className="px-5 py-3">
                        <Link to={`/problems/${p.problemId}`} className="font-medium text-white hover:text-brand-400">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className={difficultyBadge(p.difficulty)}>{p.difficulty}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(p.tags || []).slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-400">{acceptance}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;
