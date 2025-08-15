// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const {
  login,
  checkPhoneNumber,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// Login route (all users)
router.post("/login", login);
// check phone
router.post("/checkphone", checkPhoneNumber);
// Reset password route (all users)
router.post("/reset-password", resetPassword);
// change password route (all users)
router.patch("/change-password", verifyToken, changePassword);

module.exports = router;
