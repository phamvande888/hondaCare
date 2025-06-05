const User = require("../models/usersModel");
const {
  isValidEmail,
  isValidVietnamesePhoneNumber,
} = require("../utils/validators");
const bcrypt = require("bcrypt");

// Create a new user (adminstration, branch manager)
const createUser = async (req, res) => {
  try {
    // data user
    const fullName = req.body.fullName?.trim(); // Full name is required
    const email = req.body.email?.trim() || null; // Default email is null
    const phoneNumber = req.body.phoneNumber?.trim(); // Phone number is required
    const password = req.body.password?.trim(); // Password is required
    const role = req.body.role?.trim() || "Customer"; // Default role is Customer
    const gender = req.body.gender?.trim() || "Other"; // Default gender is Other
    const address = req.body.address?.trim(); // Address is required
    const branch_id = req.body.branch_id?.trim() || null; // Default branch_id is null
    const images = req.files?.map((file) => file.filename || file.path) || []; // Images are optional, default to an empty array

    // Check if required fields are present
    const requiredFields = ["fullName", "phoneNumber", "password", "address"];
    const missingFields = requiredFields.filter(
      (field) => !req.body[field] || req.body[field].toString().trim() === ""
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate email format
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    // Validate VietNam phone number
    if (!isValidVietnamesePhoneNumber(phoneNumber)) {
      return res.status(400).json({
        error:
          "Invalid phone number format. Must be a valid Vietnamese phone number.",
      });
    }
    // Check email or phone number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      let conflictField =
        existingUser.email === email ? "email" : "phoneNumber";
      return res.status(409).json({
        error: `User with this ${conflictField} already exists.`,
      });
    }

    // ✅ hash password by bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      gender,
      address,
      branch_id,
      images,
    });
    await user.save();
    res
      .status(201)
      .json({ message: "User created successfully", new_user: user });
  } catch (error) {
    console.error("User creation error:", error);
    res
      .status(400)
      .json({ message: "Error creating user", error: error.message || error });
  }
};

module.exports = {
  createUser,
  // Add other user-related functions here (e.g., getUserById, updateUser, deleteUser)
};
