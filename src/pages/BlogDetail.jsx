import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  Trash2,
  Edit,
  Send,
  CornerDownRight,
  Reply,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";



const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentContent, setCommentContent] = useState("");
  const [commenting, setCommenting] = useState(false);

  const [replyContents, setReplyContents] = useState({}); // { [commentId]: string }
  const [replyingTo, setReplyingTo] = useState(null); // commentId
  const [submittingReply, setSubmittingReply] = useState(false);

  const [liking, setLiking] = useState(false);

  const fetchBlog = async () => {
    try {
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data.blog);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load blog post.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.post(`/blogs/${id}/like`);
      setBlog((prev) => ({ ...prev, likes: res.data.likes }));
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setCommenting(true);
    try {
      const res = await api.post(`/blogs/${id}/comments`, { content: commentContent });
      setBlog(res.data.blog);
      setCommentContent("");
    } catch (err) {
      console.error("Post comment error:", err);
    } finally {
      setCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await api.delete(`/blogs/${id}/comments/${commentId}`);
      setBlog(res.data.blog);
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  const handlePostReply = async (e, commentId) => {
    e.preventDefault();
    const content = replyContents[commentId];
    if (!content || !content.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.post(`/blogs/${id}/comments/${commentId}/replies`, { content });
      setBlog(res.data.blog);
      setReplyContents((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingTo(null);
    } catch (err) {
      console.error("Post reply error:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await api.delete(`/blogs/${id}/comments/${commentId}/replies/${replyId}`);
      setBlog(res.data.blog);
    } catch (err) {
      console.error("Delete reply error:", err);
    }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      navigate("/blogs");
    } catch (err) {
      console.error("Delete blog error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mb-4 rounded-xl border border-rose-950 bg-rose-950/20 py-6 text-rose-400 font-medium">
          {error || "Blog post not found."}
        </div>
        <Link to="/blogs" className="inline-flex items-center gap-2 text-sm text-brand-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Link>
      </div>
    );
  }

  const isPostAuthor = blog.author?._id === user?.id;
  const isPostLiked = blog.likes?.includes(user?.id);
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <Link
        to="/blogs"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blogs
      </Link>

      {/* Main Blog Post */}
      <article className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 md:p-8 backdrop-blur mb-8">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
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
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3.5xl mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-base whitespace-pre-wrap mb-8">
          {blog.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(blog.tags || []).map((t) => (
            <span
              key={t}
              className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1 text-xs text-slate-400"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Post Actions (Like, Edit, Delete) */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-800/80 pt-6 mt-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isPostLiked
                ? "bg-brand-500/10 border border-brand-500/40 text-brand-400 hover:bg-brand-500/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <ThumbsUp className={`h-4.5 w-4.5 ${isPostLiked ? "fill-brand-400" : ""}`} />
            {isPostLiked ? "Liked" : "Like"}
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-800/60 text-slate-300 font-mono">
              {blog.likes?.length || 0}
            </span>
          </button>

          {(isPostAuthor || isAdmin) && (
            <div className="flex gap-2">
              <Link
                to={`/blogs/${blog._id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-brand-500 hover:text-brand-400"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Link>
              <button
                onClick={handleDeleteBlog}
                className="flex items-center gap-1.5 rounded-lg border border-rose-900/60 px-3.5 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-950/20 hover:border-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Comment Section Header */}
      <div className="mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-brand-500" />
        <h2 className="text-xl font-bold text-white">Comments</h2>
        <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-mono text-xs text-slate-400 border border-slate-800">
          {blog.comments?.length || 0}
        </span>
      </div>

      {/* Post a New Comment */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur mb-8">
        {isAuthenticated ? (
          <form onSubmit={handlePostComment} className="flex gap-3 items-start">
            <div className="hidden sm:block">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                <User className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                required
                rows={3}
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Share your thought or ask a question..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-slate-950 transition"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={commenting || !commentContent.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-500 shadow-md shadow-brand-600/10 disabled:opacity-50"
                >
                  {commenting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <Send className="h-3.5 w-3.5" />
                  Comment
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-slate-400">
              Please{" "}
              <Link to="/auth" className="text-brand-400 hover:underline font-semibold">
                login
              </Link>{" "}
              to post comments and join the discussion.
            </p>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {(!blog.comments || blog.comments.length === 0) && (
          <div className="text-center py-6 text-slate-500 text-sm">
            No comments yet. Start the conversation!
          </div>
        )}

        {(blog.comments || []).map((comment) => {
          const isCommentOwner = comment.author?._id === user?.id;
          const canDeleteComment = isCommentOwner || isPostAuthor || isAdmin;
          const commentDate = new Date(comment.createdAt || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={comment._id} className="group/comment border-l-2 border-slate-800 pl-4 py-1 space-y-4">
              {/* Commenter profile, details */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Link
                      to={`/profile/${comment.author?.username}`}
                      className="font-semibold text-slate-300 hover:text-brand-400 transition"
                    >
                      {comment.author?.username || "deleted_user"}
                    </Link>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500">{commentDate}</span>
                  </div>
                  {/* Comment content */}
                  <p className="mt-1.5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>

                {/* Comment actions (delete, reply) */}
                <div className="flex items-center gap-1">
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === comment._id ? null : comment._id);
                        setReplyContents((prev) => ({ ...prev, [comment._id]: "" }));
                      }}
                      className="rounded p-1 text-slate-500 hover:text-brand-400 hover:bg-slate-900 transition"
                      title="Reply"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {canDeleteComment && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="rounded p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                      title="Delete Comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Replies Nesting */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-4 border-l border-slate-800/60 space-y-3 pt-2">
                  {comment.replies.map((reply) => {
                    const isReplyOwner = reply.author?._id === user?.id;
                    const canDeleteReply = isReplyOwner || isCommentOwner || isPostAuthor || isAdmin;
                    const replyDate = new Date(reply.createdAt || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div key={reply._id} className="flex items-start justify-between gap-3 bg-slate-900/10 p-2 rounded-lg">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <CornerDownRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                            <Link
                              to={`/profile/${reply.author?.username}`}
                              className="font-semibold text-slate-300 hover:text-brand-400 transition"
                            >
                              {reply.author?.username || "deleted_user"}
                            </Link>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500">{replyDate}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-300 pl-5 whitespace-pre-wrap leading-relaxed">
                            {reply.content}
                          </p>
                        </div>

                        {canDeleteReply && (
                          <button
                            onClick={() => handleDeleteReply(comment._id, reply._id)}
                            className="rounded p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition shrink-0 self-start"
                            title="Delete Reply"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Inline Reply input field */}
              {replyingTo === comment._id && (
                <form
                  onSubmit={(e) => handlePostReply(e, comment._id)}
                  className="pl-5 pt-2 flex gap-2 items-center"
                >
                  <textarea
                    required
                    rows={1}
                    value={replyContents[comment._id] || ""}
                    onChange={(e) =>
                      setReplyContents((prev) => ({ ...prev, [comment._id]: e.target.value }))
                    }
                    placeholder="Write a reply..."
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-brand-500 focus:bg-slate-950 transition resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingReply || !(replyContents[comment._id] || "").trim()}
                    className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-500 disabled:opacity-50"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogDetail;
