const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  addComment,
  deleteComment,
  addReply,
  deleteReply,
} = require("../controllers/blogController");
const { verifyToken, optionalVerifyToken } = require("../middleware/auth");

router.get("/", optionalVerifyToken, getBlogs);
router.get("/:id", optionalVerifyToken, getBlogById);
router.post("/", verifyToken, createBlog);
router.put("/:id", verifyToken, updateBlog);
router.delete("/:id", verifyToken, deleteBlog);
router.post("/:id/like", verifyToken, toggleLike);
router.post("/:id/comments", verifyToken, addComment);
router.delete("/:id/comments/:commentId", verifyToken, deleteComment);
router.post("/:id/comments/:commentId/replies", verifyToken, addReply);
router.delete("/:id/comments/:commentId/replies/:replyId", verifyToken, deleteReply);

module.exports = router;
