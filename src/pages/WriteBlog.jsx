import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Info } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const WriteBlog = () => {
  const { user } = useAuth();
  const { id } = useParams(); // present if editing
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!id;

  useEffect(() => {
    if (!isEditMode) return;

    const fetchBlog = async () => {
      setFetching(true);
      try {
        const res = await api.get(`/blogs/${id}`);
        const blog = res.data.blog;
        
        // Ensure user is the author or admin
        if (blog.author?._id !== user?.id && user?.role !== "admin") {
          setError("You are not authorized to edit this blog post.");
          return;
        }

        setTitle(blog.title);
        setContent(blog.content);
        setTagsInput(blog.tags ? blog.tags.join(", ") : "");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch blog post.");
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [id, isEditMode, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (isEditMode) {
        await api.put(`/blogs/${id}`, { title, content, tags });
        navigate(`/blogs/${id}`);
      } else {
        const res = await api.post("/blogs", { title, content, tags });
        navigate(`/blogs/${res.data.blog._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong saving the post.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        to={isEditMode ? `/blogs/${id}` : "/blogs"}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {isEditMode ? "Blog Details" : "Blogs"}
      </Link>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8 backdrop-blur">
        <h1 className="text-2xl font-bold text-white mb-6">
          {isEditMode ? "Edit Blog Post" : "Create New Post"}
        </h1>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-950 bg-rose-950/20 px-4 py-3.5 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Informative tips */}
        {!error && (
          <div className="mb-6 flex gap-2.5 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3.5 text-xs text-slate-400">
            <Info className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">Quick Tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Make titles clear, descriptive, and related to competitive programming or tech.</li>
                <li>Separate tags with commas (e.g. `dp, segment tree, graph`).</li>
                <li>Content formatting: You can write standard text or copy-paste your codes directly.</li>
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Beginner's Guide to Dynamic Programming"
              disabled={loading || (isEditMode && error)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-slate-950 transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Tags <span className="text-xs text-slate-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. tutorial, dp, math"
              disabled={loading || (isEditMode && error)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-slate-950 transition"
            />
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Content</label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here... Supports standard multiline layout."
              disabled={loading || (isEditMode && error)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-slate-950 transition font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Submit/Cancel buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              to={isEditMode ? `/blogs/${id}` : "/blogs"}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || (isEditMode && error)}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 shadow-lg shadow-brand-600/20 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {isEditMode ? "Update Post" : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WriteBlog;
