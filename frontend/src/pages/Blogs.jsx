import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Loader2, ThumbsUp, MessageSquare, PenTool, Calendar, User } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";



const Blogs = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await api.get("/blogs");
        setBlogs(res.data.blogs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    blogs.forEach((b) => (b.tags || []).forEach((t) => tagSet.add(t)));
    return ["All", ...Array.from(tagSet).sort()];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.content.toLowerCase().includes(search.toLowerCase()) ||
        (b.author?.username || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesTag = selectedTag === "All" || (b.tags || []).includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [blogs, search, selectedTag]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Developer <span className="text-brand-500">Blogs</span>
          </h1>
          <p className="mt-2 text-slate-400">
            Share your competitive programming ideas, tips, tutorials, and experiences.
          </p>
        </div>
        <div>
          <Link
            to="/blogs/new"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-500 shadow-lg shadow-brand-600/20"
          >
            <PenTool className="h-4 w-4" />
            Write a Post
          </Link>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, content, or author..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-slate-900 transition-all"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-2 max-w-full overflow-x-auto pb-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedTag === tag
                  ? "bg-brand-500 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Blog list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-950 bg-rose-950/20 py-8 text-center text-rose-400 font-medium">
          {error}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 py-16 text-center text-slate-500">
          No blog posts found matching your search.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBlogs.map((blog) => {
            const dateStr = new Date(blog.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            // Strip HTML or markdown-like content for preview
            const textPreview = blog.content
              .replace(/[#*`_]/g, "") // Simple strip markdown syntax
              .substring(0, 200) + (blog.content.length > 200 ? "..." : "");

            return (
              <article
                key={blog._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                    <Link
                      to={`/profile/${blog.author?.username}`}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-brand-400 transition"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>
                        {blog.author?.username || "deleted_user"}
                      </span>
                    </Link>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors duration-200">
                    <Link to={`/blogs/${blog._id}`}>{blog.title}</Link>
                  </h2>

                  {/* Body Snippet */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
                    {textPreview}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(blog.tags || []).map((t) => (
                      <span
                        key={t}
                        className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-0.5 text-xs text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Likes and Comments stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1 hover:text-white transition">
                      <ThumbsUp className="h-4 w-4 text-slate-500" />
                      {blog.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1 hover:text-white transition">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                      {blog.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Blogs;
