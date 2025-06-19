// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// Login route (all users)
router.post("/login", login);

module.exports = router;
