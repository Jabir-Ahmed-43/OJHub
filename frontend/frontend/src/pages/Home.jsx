import React from "react";
import { Link } from "react-router-dom";
import { Code2, Trophy, ListChecks, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      {/* Hero section */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <Code2 className="h-14 w-14 text-brand-500" />
        </div>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Welcome to OJ<span className="text-brand-500">Hub</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Practice algorithmic problems, compete in rated contests, and track your growth as a
          competitive programmer.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/problems"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Start Solving <ArrowRight className="h-4 w-4" />
          </Link>
          {!isAuthenticated && (
            <Link
              to="/auth"
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-brand-500"
            >
              Create Account
            </Link>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          to="/problems"
          className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-brand-500/50"
        >
          <ListChecks className="h-8 w-8 text-brand-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">Problem Set</h3>
          <p className="mt-1 text-sm text-slate-400">
            Browse a curated set of algorithmic challenges spanning every difficulty and topic.
          </p>
        </Link>
        <Link
          to="/contests"
          className="group rounded-xl border border-slate-800 bg-slate-900 p-6 transition hover:border-brand-500/50"
        >
          <Trophy className="h-8 w-8 text-brand-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">Rated Contests</h3>
          <p className="mt-1 text-sm text-slate-400">
            Compete head-to-head against the community in ICPC and IOI style contests.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
