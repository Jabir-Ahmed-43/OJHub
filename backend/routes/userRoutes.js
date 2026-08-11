const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserProfile,
  updateUserRole,
  deleteUser,
  updateUserProfile,
} = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:username", getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/:id/role", verifyToken, isAdmin, updateUserRole);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;
