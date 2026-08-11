import React, { useState, useEffect } from "react";

const ContestTimer = ({ startTime, durationMinutes, onExpire }) => {
  const [status, setStatus] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const end = start + durationMs;

    const updateTimer = () => {
      const now = new Date().getTime();

      if (now < start) {
        setStatus("Upcoming");
        const diff = start - now;
        setTimeStr(formatTime(diff));
      } else if (now >= start && now < end) {
        setStatus("Running");
        const diff = end - now;
        if (diff <= 1000) {
          // Hit zero
          if (onExpire) onExpire();
        }
        setTimeStr(formatTime(diff));
      } else {
        setStatus("Ended");
        setTimeStr("Contest has ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationMinutes, onExpire]);

  const formatTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (status === "Upcoming") {
    return (
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-4 py-2.5 text-center font-mono text-sm font-bold text-blue-400">
        Starts in: {timeStr}
      </div>
    );
  }

  if (status === "Running") {
    return (
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-center font-mono text-sm font-bold text-emerald-400">
        Time left: {timeStr}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-slate-500/10 border border-slate-500/30 px-4 py-2.5 text-center font-mono text-sm font-bold text-slate-400">
      Contest has ended
    </div>
  );
};

export default ContestTimer;
