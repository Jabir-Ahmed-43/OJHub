import React, { useEffect, useState } from "react";
import { Users, ListChecks, Trophy, Send } from "lucide-react";
import api from "../api/axios";

const Card = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="rounded-lg bg-brand-500/10 p-2.5 text-brand-400">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const AdminOverview = () => {
  const [counts, setCounts] = useState({ users: 0, problems: 0, contests: 0, submissions: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [usersRes, problemsRes, contestsRes, submissionsRes] = await Promise.all([
          api.get("/users"),
          api.get("/problems", { params: {} }),
          api.get("/contests"),
          api.get("/submissions"),
        ]);
        setCounts({
          users: usersRes.data.count,
          problems: problemsRes.data.count,
          contests: contestsRes.data.count,
          submissions: submissionsRes.data.count,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Admin Overview</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={Users} label="Total Users" value={counts.users} />
        <Card icon={ListChecks} label="Total Problems" value={counts.problems} />
        <Card icon={Trophy} label="Total Contests" value={counts.contests} />
        <Card icon={Send} label="Total Submissions" value={counts.submissions} />
      </div>
    </div>
  );
};

export default AdminOverview;
