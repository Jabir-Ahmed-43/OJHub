const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyFirebaseToken } = require("../utils/firebaseAuth");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are all required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check uniqueness explicitly so we can give a specific error message
    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        field: "username",
        message: "Username already exists. Please choose another one.",
      });
    }

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        field: "email",
        message: "An account with this email already exists.",
      });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName || "",
      role,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    // Handle race-condition duplicate key errors from MongoDB itself
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || { username: 1 })[0];
      return res.status(409).json({
        success: false,
        field,
        message: `${field === "username" ? "Username" : "Email"} already exists.`,
      });
    }
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = username or email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
      });
    }

    const user = await User.findOne({
      $or: [{ username: identifier.trim() }, { email: identifier.trim().toLowerCase() }],
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. User not found.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Incorrect password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// @route  POST /api/auth/firebase-login
// @access Public
exports.firebaseLogin = async (req, res) => {
  try {
    const { idToken, username } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
      });
    }

    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(idToken);
    } catch (err) {
      console.error("Firebase ID Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Firebase ID token.",
      });
    }

    const { email, name } = decodedToken;
    const uid = decodedToken.sub || decodedToken.user_id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is missing from the Firebase token.",
      });
    }

    // 1. Look up user by firebaseUid
    let user = await User.findOne({ firebaseUid: uid });

    // 2. If not found by firebaseUid, look up by email (e.g. existing email/password account)
    if (!user) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        // Link the Google account by setting firebaseUid
        user.firebaseUid = uid;
        await user.save();
      }
    }

    // 3. If user still doesn't exist, we need to register them
    if (!user) {
      // If username is not provided, we ask the frontend to supply one
      if (!username) {
        return res.status(200).json({
          success: true,
          isNewUser: true,
          email: email.toLowerCase().trim(),
          name: name || "",
        });
      }

      // If username is provided, perform validation
      const sanitizedUsername = username.trim();
      
      // Username validation: min 3, max 20, alphanumeric/underscore
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(sanitizedUsername)) {
        return res.status(400).json({
          success: false,
          field: "username",
          message: "Username must be 3-20 characters long and contain only letters, numbers, or underscores.",
        });
      }

      // Check if username is already taken
      const existingUser = await User.findOne({ username: sanitizedUsername });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          field: "username",
          message: "Username is already taken. Please choose another one.",
        });
      }

      const userCount = await User.countDocuments();
      const role = userCount === 0 ? "admin" : "user";

      // Create new user (password is optional, rating to 1200)
      user = await User.create({
        username: sanitizedUsername,
        email: email.toLowerCase().trim(),
        firebaseUid: uid,
        fullName: name || "",
        role,
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error("firebaseLogin error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during Firebase login.",
    });
  }
};
