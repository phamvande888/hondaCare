// controllers/authController.js
const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const { checkMissingFields } = require("../utils/validators");
// all user login function
const login = async (req, res) => {
  // get phone number and password from request body
  const phoneNumber = req.body.phoneNumber?.trim(); // phoneNumber is required
  const password = req.body.password?.trim(); // password required
  // Check if required fields are present
  const requiredFields = ["phoneNumber", "password"];
  // If any required field is missing, return an error
  const missingFields = requiredFields.filter(
    (field) => !req.body[field] || req.body[field].toString().trim() === ""
  );
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }
  try {
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Invalid phone number  or password" });
    // Check if the user is active
    if (user.isActive === false) {
      return res.status(403).json({ message: "User is not active" });
    }
    // create a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    // Return the token and user information
    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      gender: user.gender,
      address: user.address,
      branch_id: user.branch_id,
      images: user.images,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// POST /api/check-phone (all users)
const checkPhoneNumber = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber?.toString().trim();
    if (!phoneNumber) {
      res.status(400).json({ message: "Phone number is required" });
    }
    // Check if the phone number exists in the database
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(404).json({ message: "Phone number does not exist" });
    res.json({ message: "Valid phone number, continue sending OTP" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// POST reset-password (all users - after OTP verification)
const resetPassword = async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber?.toString().trim();
    const newPassword = req.body.newPassword?.toString().trim();
    const requiredFields = ["phoneNumber", "newPassword"];
    const missingFields = checkMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// PATCH change password function - all users
const changePassword = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming userId is extracted from the token
    const oldPassword = req.body.oldPassword?.toString().trim();
    const newPassword = req.body.newPassword?.toString().trim();

    // Check if required fields are present
    const requiredFields = ["oldPassword", "newPassword"];
    const missingFields = checkMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare the provided old password with the hashed password in the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Old password is incorrect" });

    // Hash the new password and update it
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: `User name ${user.fullName}-${user.phoneNumber}   changed Password successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

module.exports = { login, checkPhoneNumber, resetPassword, changePassword };
