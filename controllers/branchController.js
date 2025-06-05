const Branch = require("../models/branchModel");

// ✅ Create new branch
const createBranch = async (req, res) => {
  // Trim input fields to remove leading/trailing whitespace
  const name = req.body.name?.trim();
  const address = req.body.address?.trim();
  const phoneNumber = req.body.phoneNumber?.trim();
  const email = req.body.email?.trim();
  const images = req.files?.map((file) => file.filename || file.path);

  // Check if all required fields are provided
  const requiredFields = ["name", "address", "phoneNumber", "email"];
  const missingFields = requiredFields.filter(
    (field) => !req.body[field] || req.body[field].toString().trim() === ""
  );
  if (!images || images.length === 0) missingFields.push("images");
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  // Validate VietNam phone number
  const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9|1[2|6|8|9])[0-9]{8}$/;
  if (!vnPhoneRegex.test(phoneNumber)) {
    return res
      .status(400)
      .json({ error: "Phone number is not in Vietnamese format" });
  }
  try {
    const newBranch = new Branch({ name, address, phoneNumber, email, images });
    const savedBranch = await newBranch.save();
    res.status(201).json({
      message: "Branch created successfully ✅",
      new_branch: savedBranch,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    if (branches.length === 0) {
      return res.status(404).json({ message: "No branches found" });
    }
    res.json({
      message: "Branches retrieved successfully",
      list_branch: branches,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Get branch by ID
const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json({ message: "Get branch ID successfully", branch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Update branch
const updateBranch = async (req, res) => {
  try {
    // Trim input fields to remove leading/trailing whitespace
    const name = req.body.name?.trim();
    const address = req.body.address?.trim();
    const phoneNumber = req.body.phoneNumber?.trim();
    const email = req.body.email?.trim();
    // Check if all required fields are provided
    const images = req.files
      ? req.files.map((file) => file.filename || file.path)
      : undefined;
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Check if all required fields are provided
    const requiredFields = ["name", "address", "phoneNumber", "email"];
    const missingFields = requiredFields.filter(
      (field) => !req.body[field] || req.body[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    // Validate VietNam phone number
    const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9|1[2|6|8|9])[0-9]{8}$/;
    if (!vnPhoneRegex.test(phoneNumber)) {
      return res
        .status(400)
        .json({ error: "Phone number is not in Vietnamese format" });
    }
    // create an object to hold the update data
    const updateData = { name, address, phoneNumber, email };
    if (images !== undefined) {
      updateData.images = images;
    }
    const updatedBranch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    res.json({
      message: "Branch updated successfully",
      updated_branch: updatedBranch,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Toggle isActive status of a branch
const changeStatus = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Toggle the isActive value
    branch.isActive = !branch.isActive;
    await branch.save();

    res.json({
      message: `Branch is now ${branch.isActive ? "active" : "inactive"}`,
      isActive_now: branch.isActive,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Export all controller functions
module.exports = {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  changeStatus,
};
