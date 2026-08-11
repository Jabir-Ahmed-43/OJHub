const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getSubmissionsByUsername,
  getAllSubmissions,
  getSubmissionStatus,
} = require("../controllers/submissionController");
const { verifyToken, isAdmin, optionalVerifyToken } = require("../middleware/auth");

router.post("/", verifyToken, createSubmission);
router.get("/", optionalVerifyToken, getAllSubmissions);
router.get("/status/:id", optionalVerifyToken, getSubmissionStatus);
router.get("/:username", verifyToken, getSubmissionsByUsername);

module.exports = router;
