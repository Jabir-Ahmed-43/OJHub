import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Trophy, CheckCircle2, Send, Loader2, Award } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import CodeViewerModal from "../components/CodeViewerModal";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

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

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </div>
      <div className={`rounded-lg p-2.5 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const submissionDates = profileData?.submissionDates || [];

  const submissionsByDate = React.useMemo(() => {
    const counts = {};
    submissionDates.forEach((dateStr) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [submissionDates]);

  const heatmapData = React.useMemo(() => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 24 * 7);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const cells = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dd = String(currentDate.getDate()).padStart(2, "0");
      const key = `${yyyy}-${mm}-${dd}`;
      const count = submissionsByDate[key] || 0;

      cells.push({
        dateStr: key,
        displayDate: currentDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
        count,
        day: currentDate.getDay(),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return cells;
  }, [submissionsByDate]);

  const heatmapWeeks = React.useMemo(() => {
    const weeks = [];
    let currentWeek = [];
    heatmapData.forEach((cell, idx) => {
      currentWeek.push(cell);
      if (currentWeek.length === 7 || idx === heatmapData.length - 1) {
        while (currentWeek.length < 7) {
          currentWeek.push({ isPadding: true });
        }
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeks;
  }, [heatmapData]);

  const getMonthLabel = (week) => {
    const firstCell = week.find((c) => !c.isPadding);
    if (!firstCell) return "";
    const date = new Date(firstCell.dateStr);
    const dayOfMonth = date.getDate();
    if (dayOfMonth <= 7) {
      return date.toLocaleDateString(undefined, { month: "short" });
    }
    return "";
  };

  useEffect(() => {
    if (!user?.username) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${user.username}`);
        setProfileData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.username]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-rose-400">{error}</div>;
  }

  const { stats, recentSubmissions, hostedContests } = profileData || {};
  const profileUser = profileData?.user;

  const verdictBreakdown = stats?.verdictBreakdown || {};
  const pieData = Object.entries(verdictBreakdown).map(([name, value]) => ({ name, value }));

  // Topic mastery approximation from accepted submissions grouped by
  // (this uses problemId prefixes as a stand-in "topic" bucket since tags
  // live on the Problem model; this still gives a meaningful mastery chart).
  const topicMastery = pieData.length
    ? pieData
    : [{ name: "No Data", value: 1 }];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {profileUser?.username}</h1>
          <p className="mt-1 text-sm text-slate-400">Here's your competitive programming journey.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          label="Problems Solved"
          value={stats?.solvedCount ?? 0}
          accent="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          icon={Send}
          label="Total Submissions"
          value={stats?.totalSubmissions ?? 0}
          accent="bg-brand-500/10 text-brand-400"
        />
        <StatCard
          icon={Award}
          label="Contests Hosted"
          value={hostedContests?.length ?? 0}
          accent="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          icon={Trophy}
          label="Accepted"
          value={stats?.accepted ?? 0}
          accent="bg-violet-500/10 text-violet-400"
        />
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">My Hosted Contests</h3>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              {hostedContests?.length || 0} total
            </span>
          </div>
          <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-800/60 pr-1">
            {(!hostedContests || hostedContests.length === 0) && (
              <p className="py-8 text-center text-sm text-slate-500">No hosted contests yet.</p>
            )}
            {hostedContests && hostedContests.map((c) => (
              <div key={c._id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-white">{c.contestName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(c.startTime).toLocaleDateString()} • {c.durationHours}h
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  c.approvalStatus === "Approved" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
                  c.approvalStatus === "Pending" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                  "text-rose-400 bg-rose-500/10 border-rose-500/30"
                }`}>
                  {c.approvalStatus === "Pending" ? "Pending Approval" : c.approvalStatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Verdict Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={topicMastery}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {topicMastery.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "rgb(var(--slate-900))", border: "1px solid rgb(var(--slate-700))", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "rgb(var(--slate-400))" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submission Activity Heatmap */}
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-200">Submission Activity</h3>
        <div className="flex flex-col overflow-x-auto font-sans">
          <div className="flex gap-1 pl-6 text-[10px] text-slate-500 mb-1 select-none h-4">
            {heatmapWeeks.map((week, wIndex) => {
              const label = getMonthLabel(week);
              return (
                <div key={wIndex} className="w-3 text-center flex-shrink-0 relative">
                  {label && <span className="absolute -translate-y-1 left-0">{label}</span>}
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 text-[10px] text-slate-500 pt-0.5 select-none w-4 pr-1">
              <span>Mon</span>
              <span className="opacity-0">Tue</span>
              <span>Wed</span>
              <span className="opacity-0">Thu</span>
              <span>Fri</span>
              <span className="opacity-0">Sat</span>
              <span className="opacity-0">Sun</span>
            </div>

            <div className="flex gap-1 flex-1">
              {heatmapWeeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1 flex-shrink-0">
                  {week.map((cell, cIndex) => {
                    if (cell.isPadding) {
                      return <div key={`pad-${cIndex}`} className="h-3 w-3 opacity-0" />;
                    }

                    let bgClass = "bg-slate-800";
                    if (cell.count > 0 && cell.count <= 2) {
                      bgClass = "bg-brand-500/20";
                    } else if (cell.count > 2 && cell.count <= 5) {
                      bgClass = "bg-brand-500/50";
                    } else if (cell.count > 5 && cell.count <= 9) {
                      bgClass = "bg-brand-500";
                    } else if (cell.count > 9) {
                      bgClass = "bg-brand-600";
                    }

                    return (
                      <div
                        key={cell.dateStr}
                        title={`${cell.count} submission${cell.count === 1 ? "" : "s"} on ${cell.displayDate}`}
                        className={`h-3 w-3 rounded-sm ${bgClass} transition-colors hover:scale-125 cursor-pointer`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-3 text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <div>
                Total Submissions: <span className="font-semibold text-white">{submissionDates.length}</span>
              </div>
              <div>
                Active Days: <span className="font-semibold text-white">{Object.keys(submissionsByDate).length}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 select-none">
              <span>Less</span>
              <div className="h-3 w-3 rounded-sm bg-slate-800" />
              <div className="h-3 w-3 rounded-sm bg-brand-500/20" />
              <div className="h-3 w-3 rounded-sm bg-brand-500/50" />
              <div className="h-3 w-3 rounded-sm bg-brand-500" />
              <div className="h-3 w-3 rounded-sm bg-brand-600" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent submissions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-200">Recent Submissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-500">
                <th className="px-5 py-3">Problem</th>
                <th className="px-5 py-3">Language</th>
                <th className="px-5 py-3">Verdict</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {(recentSubmissions || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No submissions yet. Go solve something!
                  </td>
                </tr>
              )}
              {(recentSubmissions || []).map((s) => (
                <tr
                  key={s._id}
                  onClick={() => setSelectedSubmission(s)}
                  className="cursor-pointer border-b border-slate-800/60 transition hover:bg-slate-800/50"
                >
                  <td className="px-5 py-3 font-medium text-white">{s.problemTitle || s.problemId}</td>
                  <td className="px-5 py-3 uppercase text-slate-400">{s.language}</td>
                  <td className={`px-5 py-3 font-semibold ${getVerdictColor(s.verdict)}`}>
                    {s.verdict}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{s.executionTime} ms</td>
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <CodeViewerModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      )}
    </div>
  );
};

export default Dashboard;
