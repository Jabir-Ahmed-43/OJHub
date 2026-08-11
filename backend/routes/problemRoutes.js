const express = require("express");
const router = express.Router();
const {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");
const { verifyToken, isAdmin, optionalVerifyToken } = require("../middleware/auth");

router.get("/", optionalVerifyToken, getProblems);
router.get("/:id", getProblemById);
router.post("/", verifyToken, isAdmin, createProblem);
router.put("/:id", verifyToken, isAdmin, updateProblem);
router.delete("/:id", verifyToken, isAdmin, deleteProblem);

module.exports = router;
