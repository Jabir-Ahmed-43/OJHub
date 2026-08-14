import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, User as UserIcon, Trophy, CheckCircle2, Edit2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";



const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", bio: "", institute: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${username}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "User not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

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

  const { user, stats } = data;

  const startEdit = () => {
    setForm({
      fullName: user.fullName || "",
      bio: user.bio || "",
      institute: user.institute || "",
      country: user.country || "",
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const res = await api.put("/users/profile", form);
      // Update locally rendered data
      setData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...res.data.user,
        },
      }));
      // Update global context user
      if (currentUser?.username === username) {
        updateUser(res.data.user);
      }
      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess("");
      }, 1000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500";
  const labelClass = "mb-1 block text-sm font-medium text-slate-300";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Edit Profile</h2>
            {saveError && <p className="text-sm text-rose-400">{saveError}</p>}
            {saveSuccess && <p className="text-sm text-emerald-400">{saveSuccess}</p>}

            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className={inputClass}
                placeholder="e.g. Abdur Rahman"
              />
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className={inputClass}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Institute</label>
                <input
                  type="text"
                  value={form.institute}
                  onChange={(e) => setForm((f) => ({ ...f, institute: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. Sylhet Engineering College"
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. Bangladesh"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50 transition"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/10">
                <UserIcon className="h-8 w-8 text-brand-400" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                  {currentUser?.username === username && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-brand-500 hover:text-brand-400 transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                    </button>
                  )}
                </div>
                {user.fullName && (
                  <p className="text-sm font-semibold text-slate-200 mt-1">{user.fullName}</p>
                )}
                {user.bio && (
                  <p className="text-sm text-slate-400 mt-1 italic">"{user.bio}"</p>
                )}
                <div className="mt-3 flex flex-col gap-1 text-sm text-slate-400">
                  {user.institute && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">🏫</span>
                      <span>{user.institute}</span>
                    </div>
                  )}
                  {user.country && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">📍</span>
                      <span>{user.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 p-4 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" />
                <p className="mt-1 text-xl font-bold text-white">{stats.solvedCount}</p>
                <p className="text-xs text-slate-500">Solved</p>
              </div>
              <div className="rounded-lg border border-slate-800 p-4 text-center">
                <Trophy className="mx-auto h-5 w-5 text-brand-400" />
                <p className="mt-1 text-xl font-bold text-white">{stats.totalSubmissions}</p>
                <p className="text-xs text-slate-500">Submissions</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
