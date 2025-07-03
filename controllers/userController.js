const User = require("../models/usersModel");
const {
  isValidEmail,
  isValidVietnamesePhoneNumber,
} = require("../utils/validators");
const bcrypt = require("bcrypt");
const Branch = require("../models/branchModel");
const mongoose = require("mongoose");
// admin or branch manager Create a new user (adminstration, branch manager)
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
      $or: [{ phoneNumber }],
    });
    if (existingUser) {
      return res.status(409).json({
        error: `User with this phone already exists.`,
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
// all user Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request parameters
    // data user
    const fullName = req.body.fullName?.trim(); // Full name is required
    const email = req.body.email?.trim() || null; // Default email is null
    const phoneNumber = req.body.phoneNumber?.trim(); // Phone number is required
    const gender = req.body.gender?.trim() || "Other"; // Default gender is Other
    const address = req.body.address?.trim(); // Address is required
    const images = req.files?.map((file) => file.filename || file.path) || []; // Images are optional

    // Check if required fields are present
    const requiredFields = ["fullName", "phoneNumber", "address"];
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

    // Check phoneNumber or email already exists (exclude current user)
    const existingUser = await User.findOne({
      $or: [{ phoneNumber }, { email }],
      _id: { $ne: userId }, // exclude current user by id
    });
    if (existingUser) {
      let conflictField =
        existingUser.email === email ? "email" : "phoneNumber";
      return res.status(409).json({
        error: `User with this ${conflictField} already exists.`,
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        phoneNumber,
        gender,
        address,
        images,
      },
      { new: true } // return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      message: "Error updating user",
      error: error.message || error,
    });
  }
};

// admin or branch manager update isActive status of a user
const changeAccountStatus = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request parameters

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Toggle the isActive status
    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      account_name: user.fullName,
      message: `User is now ${user.isActive ? "active" : "inactive"}`,
      isActive_now: user.isActive,
    });
  } catch (error) {
    console.error("Error changing user status:", error);
    return res.status(500).json({
      message: "Error changing user status",
      error: error.message || error,
    });
  }
};

// get profile user by id
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from request parameters
    const user = await User.findById(userId)
      .select(
        "-password" // Exclude password from the response
      )
      .populate("branch_id", "name address phoneNumber email images"); // Populate branch details

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return res.status(500).json({
      message: "Error getting user profile",
      error: error.message || error,
    });
  }
};

// list customers
const getListCustomers = async (req, res) => {
  try {
    const list = await User.find({ role: "Customer" })
      .select("-password") // Exclude password from the response
      .populate("branch_id", "name address phoneNumber email images"); // Populate branch details
    if (!list || list.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }
    return res.json({
      message: "Get list customers successfully",
      list_Customer: list,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({
      message: "Error listing users",
      error: error.message || error,
    });
  }
};

// list Branch Manager (for Administrator)
const getListBranchManager = async (req, res) => {
  try {
    const list = await User.find({ role: "Branch Manager" })
      .select("-password") // Exclude password from the response
      .populate("branch_id", "name address phoneNumber email images"); // Populate branch details
    if (!list || list.length === 0) {
      return res.status(404).json({ message: "No Branch Manager found" });
    }
    return res.json({
      message: "Get list Branch Manager successfully",
      list_Branch_Manager: list,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({
      message: "Error listing users",
      error: error.message || error,
    });
  }
};

// list Warehouse Staff (for Administrator)
const getListWarehouseStaff = async (req, res) => {
  try {
    const list = await User.find({ role: "Warehouse Staff" })
      .select("-password") // Exclude password from the response
      .populate("branch_id", "name address phoneNumber email images"); // Populate branch details
    if (!list || list.length === 0) {
      return res.status(404).json({ message: "No Warehouse Staff found" });
    }
    return res.json({
      message: "Get list Warehouse Staff successfully",
      list_Warehouse_Staff: list,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({
      message: "Error listing users",
      error: error.message || error,
    });
  }
};

const getListWarehouseStaffByBranch = async (req, res) => {
  try {
    const branchId = req.params.branchId;

    if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({ message: "Invalid or missing branchId" });
    }

    // find branch by ID
    const branch = await Branch.findById(branchId).select(
      "name address phoneNumber email images"
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const list = await User.find({
      role: "Warehouse Staff",
      branch_id: branchId,
    })
      .select("-password")
      .populate("branch_id", "name address phoneNumber email images");

    if (!list || list.length === 0) {
      return res
        .status(404)
        .json({ message: "No Warehouse Staff found in this branch" });
    }

    return res.json({
      message: `List of Warehouse Staff in branch: ${branch.name}`,
      branch, // 👈 Thông tin chi nhánh
      list_Warehouse_Staff: list,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    return res.status(500).json({
      message: "Error listing Warehouse Staff",
      error: error.message || error,
    });
  }
};

module.exports = {
  createUser,
  updateProfile,
  changeAccountStatus,
  getUserProfile,
  getListCustomers,
  getListBranchManager,
  getListWarehouseStaff,
  getListWarehouseStaffByBranch,
};
