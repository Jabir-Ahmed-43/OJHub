const express = require("express");
const router = express.Router();
const { register, login, getMe, firebaseLogin } = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/firebase-login", firebaseLogin);
router.get("/me", verifyToken, getMe);

module.exports = router;
