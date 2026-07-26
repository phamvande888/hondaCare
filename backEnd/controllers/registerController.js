const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const {
  checkMissingFields,
  isValidVietnamesePhoneNumber,
  isValidEmail,
} = require("../utils/validators");

const register = async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const phoneNumber = req.body.phoneNumber?.trim();
    const password = req.body.password?.trim();
    const email = req.body.email?.trim() || null;
    const address = req.body.address?.trim() || null;
    const missingFields = checkMissingFields(req.body, ["fullName", "phoneNumber", "password"]);

    if (missingFields.length) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }
    if (!isValidVietnamesePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: "Invalid Vietnamese phone number" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (await User.exists({ phoneNumber })) {
      return res.status(409).json({ error: "Phone number already exists" });
    }

    const user = await User.create({
      fullName,
      phoneNumber,
      password: await bcrypt.hash(password, 10),
      email,
      address,
      role: "Customer",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: { id: user._id, fullName: user.fullName, phoneNumber: user.phoneNumber, role: user.role },
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "Phone number already exists" });
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = register;