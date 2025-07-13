const ServiceSystem = require("../models/serviceSystemModel");
const validators = require("../utils/validators");
const { checkMissingFields } = require("../utils/validators");
const Branch = require("../models/branchModel");
const path = require("path");
const fs = require("fs");
const { deleteFiles } = require("../utils/fileHelper");
const mongoose = require("mongoose");

// Create a new service system
const createServiceSystem = async (req, res) => {
  const uploadedFiles = req.files || [];

  // detele file when create fail
  const removeUploadedFiles = () => {
    uploadedFiles.forEach((file) => {
      const filePath = path.join(__dirname, "../uploads", file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  };

  try {
    const { name, description, price, estimatedTime, category } = req.body;
    const images = req.files?.map((file) => file.filename || file.path) || []; // Images are optional, default to an empty array

    // Check if images were uploaded
    if (!images || images.length === 0) {
      return res.status(400).json({
        error: "At least one image must be uploaded.",
      });
    }
    // Check if required fields are present
    const requiredFields = [
      "name",
      "description",
      "price",
      "estimatedTime",
      "category",
    ];

    const missingFields = checkMissingFields(req.body, requiredFields);

    if (missingFields.length > 0) {
      removeUploadedFiles();
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    // check category
    const allowedCategories = ["maintenance", "repair", "check"];
    if (!allowedCategories.includes(category)) {
      removeUploadedFiles();
      return res.status(400).json({
        error: "Category must be one of: maintenance, repair, or check",
      });
    }

    // Validate estimatedTime
    const parsedEstimatedTime = parseFloat(estimatedTime);
    if (isNaN(parsedEstimatedTime) || parsedEstimatedTime < 0) {
      removeUploadedFiles();
      return res.status(400).json({
        error: "Estimated time must be a valid positive number (in hours).",
      });
    }

    // Validate price
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      removeUploadedFiles();
      return res.status(400).json({
        error: "Price must be a valid non-negative number.",
      });
    }

    //  branch_ids[]
    const rawBranchIds = req.body["branch_ids[]"] || req.body.branch_ids;
    const branchIds = Array.isArray(rawBranchIds)
      ? rawBranchIds
      : [rawBranchIds];

    const branches = [];
    for (const id of branchIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        removeUploadedFiles();
        return res.status(400).json({ error: `Invalid branch_id: ${id}` });
      }

      const branch = await Branch.findById(id);
      if (!branch) {
        removeUploadedFiles();
        return res.status(404).json({ error: `Branch not found: ${id}` });
      }

      branches.push({ branch: branch._id, isActive: true });
    }

    const newServiceSystem = new ServiceSystem({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      estimatedTime: parsedEstimatedTime,
      images,
      category,
      branches,
    });

    await newServiceSystem.save();
    res.status(201).json({
      message: "Service system created successfully.",
      data: newServiceSystem,
    });
  } catch (error) {
    console.error("Error creating service system:", error);
    res.status(500).json({ message: error });
  }
};

// Update a service system
const updateServiceSystem = async (req, res) => {
  const { id } = req.params;
  const uploadedFiles = req.files || [];
  const newImages = uploadedFiles.map((file) => file.filename);

  try {
    const { name, description, price, estimatedTime, category } = req.body;

    const service = await ServiceSystem.findById(id);
    if (!service) {
      deleteFiles(newImages);
      return res.status(404).json({ error: "Service system not found." });
    }

    // Validate category
    if (category) {
      const allowedCategories = ["maintenance", "repair", "check"];
      if (!allowedCategories.includes(category)) {
        deleteFiles(newImages);
        return res.status(400).json({
          error: "Category must be one of: maintenance, repair, or check",
        });
      }
      service.category = category;
    }

    // Parse numbers
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        deleteFiles(newImages);
        return res.status(400).json({ error: "Invalid price value." });
      }
      service.price = parsedPrice;
    }

    if (estimatedTime !== undefined) {
      const parsedEstimatedTime = parseFloat(estimatedTime);
      if (isNaN(parsedEstimatedTime) || parsedEstimatedTime < 0) {
        deleteFiles(newImages);
        return res.status(400).json({ error: "Invalid estimatedTime value." });
      }
      service.estimatedTime = parsedEstimatedTime;
    }

    if (name) service.name = name.trim();
    if (description) service.description = description.trim();

    // ✅ Update branches
    const rawBranchIds = req.body["branch_ids[]"] || req.body.branch_ids;
    if (rawBranchIds) {
      const branchIds = Array.isArray(rawBranchIds)
        ? rawBranchIds
        : [rawBranchIds];

      const branches = [];
      for (const id of branchIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          deleteFiles(newImages);
          return res.status(400).json({ error: `Invalid branch_id: ${id}` });
        }

        const branch = await Branch.findById(id);
        if (!branch) {
          deleteFiles(newImages);
          return res.status(404).json({ error: `Branch not found: ${id}` });
        }

        branches.push({ branch: branch._id, isActive: true });
      }

      service.branches = branches;
    }

    // update new images
    if (newImages.length > 0) {
      deleteFiles(service.images); // delete old image
      service.images = newImages;
    }

    await service.save();

    return res.status(200).json({
      message: "Service system updated successfully.",
      data: service,
    });
  } catch (error) {
    console.error("Update failed:", error);
    deleteFiles(newImages); // rollback new image if erro
    return res.status(500).json({ error: error.message || error });
  }
};

module.exports = { createServiceSystem, updateServiceSystem };
