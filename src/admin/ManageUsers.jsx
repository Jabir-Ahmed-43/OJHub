import React, { useEffect, useState } from "react";
import { Loader2, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (u) => {
    setActioningId(u._id);
    try {
      const newRole = u.role === "admin" ? "user" : "admin";
      await api.put(`/users/${u._id}/role`, { role: newRole });
      setUsers((prev) => prev.map((usr) => (usr._id === u._id ? { ...usr, role: newRole } : usr)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role.");
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (u) => {
    if (u.username === currentUser?.username) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    setActioningId(u._id);
    try {
      await api.delete(`/users/${u._id}`);
      setUsers((prev) => prev.filter((usr) => usr._id !== u._id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Manage Users</h1>

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
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-800/60">
                    <td className="px-5 py-3 font-medium text-white">{u.username}</td>
                    <td className="px-5 py-3 text-slate-400">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === "admin"
                            ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                            : "border-slate-600/30 bg-slate-600/10 text-slate-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={actioningId === u._id}
                          onClick={() => toggleRole(u)}
                          title={u.role === "admin" ? "Revoke admin" : "Make admin"}
                          className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-brand-500 hover:text-brand-400 disabled:opacity-50"
                        >
                          {u.role === "admin" ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          disabled={actioningId === u._id}
                          onClick={() => handleDelete(u)}
                          title="Delete user"
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

export default ManageUsers;
