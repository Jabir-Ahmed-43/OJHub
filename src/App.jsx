import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Problems from "./pages/Problems";
import ProblemDetail from "./pages/ProblemDetail";
import Contests from "./pages/Contests";
import ContestDetail from "./pages/ContestDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import HostContest from "./pages/HostContest";
import Status from "./pages/Status";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import WriteBlog from "./pages/WriteBlog";

import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/AdminOverview";
import ManageUsers from "./admin/ManageUsers";
import ManageProblems from "./admin/ManageProblems";
import AddProblem from "./admin/AddProblem";
import CreateContest from "./admin/CreateContest";
import ManageContests from "./admin/ManageContests";

const NotFound = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center text-center">
    <h1 className="text-6xl font-bold text-brand-500">404</h1>
    <p className="mt-2 text-slate-400">The page you're looking for doesn't exist.</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/contests" element={<Contests />} />
        <Route path="/contests/:id" element={<ContestDetail />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/status" element={<Status />} />

        {/* Protected (logged-in user) routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blogs/new"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blogs/:id/edit"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contests/new-proposal"
          element={
            <ProtectedRoute>
              <HostContest />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="problems" element={<ManageProblems />} />
          <Route path="contests" element={<ManageContests />} />
          <Route path="problems/new" element={<AddProblem />} />
          <Route path="contests/new" element={<CreateContest />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
