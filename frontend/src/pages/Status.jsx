import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import StatusTable from "../components/StatusTable";
import { Loader2, Activity } from "lucide-react";

const Status = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/submissions");
      setSubmissions(res.data.submissions);
      setError("");
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError(err.response?.data?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
        <Activity className="h-7 w-7 text-brand-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Status</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time activity and solutions submitted by users across the platform.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <p className="text-center text-rose-400 py-8">{error}</p>
      ) : (
        <StatusTable
          submissions={submissions}
          currentUsername={user?.username}
          isContestRunning={false}
        />
      )}
    </div>
  );
};

export default Status;
