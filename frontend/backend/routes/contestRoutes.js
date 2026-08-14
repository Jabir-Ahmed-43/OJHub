const express = require("express");
const router = express.Router();
const {
  getContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
} = require("../controllers/contestController");
const { verifyToken, isAdmin, optionalVerifyToken } = require("../middleware/auth");

router.get("/", optionalVerifyToken, getContests);
router.get("/:id", getContestById);
router.post("/", verifyToken, createContest);
router.put("/:id", verifyToken, isAdmin, updateContest);
router.delete("/:id", verifyToken, isAdmin, deleteContest);
router.post("/:id/register", verifyToken, registerForContest);

module.exports = router;
