// controllers/authController.js
const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

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

module.exports = { login };
