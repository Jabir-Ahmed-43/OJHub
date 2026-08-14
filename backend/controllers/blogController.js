const BlogPost = require("../models/BlogPost");

// @route  GET /api/blogs
// @access Public
exports.getBlogs = async (req, res) => {
  try {
    const { search, tag } = req.query;
    const filter = {};

    if (tag && tag !== "All") {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const blogs = await BlogPost.find(filter)
      .populate("author", "username role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    console.error("GetBlogs error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching blogs." });
  }
};

// @route  GET /api/blogs/:id
// @access Public
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await BlogPost.findById(id)
      .populate("author", "username role")
      .populate("comments.author", "username role")
      .populate("comments.replies.author", "username role");

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    return res.status(200).json({ success: true, blog });
  } catch (err) {
    console.error("GetBlogById error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching blog post." });
  }
};

// @route  POST /api/blogs
// @access Private
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    const blog = new BlogPost({
      title,
      content,
      tags: tags ? tags.map(t => t.trim()).filter(Boolean) : [],
      author: req.user.id,
    });

    await blog.save();
    
    const populatedBlog = await BlogPost.findById(blog._id).populate("author", "username role");

    return res.status(201).json({ success: true, blog: populatedBlog });
  } catch (err) {
    console.error("CreateBlog error:", err);
    return res.status(500).json({ success: false, message: "Server error creating blog post." });
  }
};

// @route  PUT /api/blogs/:id
// @access Private
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const blog = await BlogPost.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    // Verify ownership or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Unauthorized update." });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    if (tags) {
      blog.tags = tags.map(t => t.trim()).filter(Boolean);
    }

    await blog.save();
    
    const populatedBlog = await BlogPost.findById(blog._id)
      .populate("author", "username role")
      .populate("comments.author", "username role")
      .populate("comments.replies.author", "username role");

    return res.status(200).json({ success: true, blog: populatedBlog });
  } catch (err) {
    console.error("UpdateBlog error:", err);
    return res.status(500).json({ success: false, message: "Server error updating blog post." });
  }
};

// @route  DELETE /api/blogs/:id
// @access Private
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await BlogPost.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    // Verify ownership or admin
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Unauthorized delete." });
    }

    await BlogPost.deleteOne({ _id: id });

    return res.status(200).json({ success: true, message: "Blog post deleted successfully." });
  } catch (err) {
    console.error("DeleteBlog error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting blog post." });
  }
};

// @route  POST /api/blogs/:id/like
// @access Private
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await BlogPost.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    const likeIndex = blog.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      blog.likes.splice(likeIndex, 1);
    } else {
      blog.likes.push(req.user.id);
    }

    await blog.save();

    return res.status(200).json({ success: true, likes: blog.likes });
  } catch (err) {
    console.error("ToggleLike error:", err);
    return res.status(500).json({ success: false, message: "Server error toggling like." });
  }
};

// @route  POST /api/blogs/:id/comments
// @access Private
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content cannot be empty." });
    }

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    blog.comments.push({
      author: req.user.id,
      content: content.trim(),
    });

    await blog.save();

    const populatedBlog = await BlogPost.findById(id)
      .populate("author", "username role")
      .populate("comments.author", "username role")
      .populate("comments.replies.author", "username role");

    return res.status(201).json({ success: true, blog: populatedBlog });
  } catch (err) {
    console.error("AddComment error:", err);
    return res.status(500).json({ success: false, message: "Server error adding comment." });
  }
};

// @route  DELETE /api/blogs/:id/comments/:commentId
// @access Private
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    // Verify ownership (comment author, blog post author, or admin)
    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isBlogAuthor = blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isCommentAuthor && !isBlogAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment." });
    }

    comment.deleteOne();
    await blog.save();

    const populatedBlog = await BlogPost.findById(id)
      .populate("author", "username role")
      .populate("comments.author", "username role")
      .populate("comments.replies.author", "username role");

    return res.status(200).json({ success: true, blog: populatedBlog });
  } catch (err) {
    console.error("DeleteComment error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting comment." });
  }
};

// @route  POST /api/blogs/:id/comments/:commentId/replies
// @access Private
exports.addReply = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Reply content cannot be empty." });
    }

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    comment.replies.push({
      author: req.user.id,
      content: content.trim(),
    });

    await blog.save();

    const populatedBlog = await BlogPost.findById(id)
      .populate("author", "username role")
      .populate("comments.author", "username role")
      .populate("comments.replies.author", "username role");

    return res.status(201).json({ success: true, blog: populatedBlog });
  } catch (err) {
    console.error("AddReply error:", err);
    return res.status(500).json({ success: false, message: "Server error adding reply." });
  }
};

// @route  DELETE /api/blogs/:id/comments/:commentId/replies/:replyId
// @access Private
exports.deleteReply = async (req, res) => {
  try {
    const { id, commentId, replyId } = req.params;

    const blog = await BlogPost.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog post not found." });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found." });
    }

    // Verify ownership (reply author, comment author, blog post author, or admin)
    const isReplyAuthor = reply.author.toString() === req.user.id;
    const isCommentAuthor = comment.author.toString() === req.user.id;
    const isBlogAuthor = blog.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isReplyAuthor && !isCommentAuthor && !isBlogAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this reply." });
    }

    reply.deleteOne();
    await blog.save();

    const populatedBlog = await BlogPost.findById(id)
      .populate("author", "username role")
      .populate("comments.author", "username role")
      .populate("comments.replies.author", "username role");

    return res.status(200).json({ success: true, blog: populatedBlog });
  } catch (err) {
    console.error("DeleteReply error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting reply." });
  }
};
