// controllers/VehiclesSystemController.js
const fs = require("fs");
const path = require("path");
const VehiclesSystem = require("../models/vehiclesSystemModel");
const { deleteFiles } = require("../utils/fileHelper");
const { checkMissingFields } = require("../utils/validators");

// create VehiclesSystem
const createVehiclesSystem = async (req, res) => {
  const uploadedFiles = req.files || [];

  try {
    // get vehicle data from request body
    const name = req.body.name?.trim();
    const model = req.body.model?.trim();
    const description = req.body.description?.trim() || null;
    const year = req.body.year ? parseInt(req.body.year) : null;
    const price = req.body.price ? parseFloat(req.body.price) : null;
    const avatar = req.files?.avatar ? req.files.avatar[0].filename : null; // nếu upload 1 ảnh đại diện
    const images = req.files?.images
      ? req.files.images.map((file) => file.filename)
      : [];

    // Check missing fields
    const requiredFields = ["name", "model", "description", "year", "price"];
    const missingFields = checkMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate year
    if (year < 1886) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({ error: "Invalid year of manufacture" });
    }

    // Validate price
    if (price < 0) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    // Kiểm tra trùng name + model (vd: Civic 1.5 Turbo đã có rồi)
    const existingVehicle = await VehiclesSystem.findOne({ name, model });
    if (existingVehicle) {
      deleteFiles(uploadedFiles);
      return res.status(409).json({
        error: `Vehicle ${name} - ${model} already exists.`,
      });
    }

    // Tạo document mới
    const vehicle = new VehiclesSystem({
      name,
      model,
      description,
      year,
      price,
      avatar,
      images,
    });

    await vehicle.save();

    res.status(201).json({
      message: "Vehicle created successfully",
      new_vehicle: vehicle,
    });
  } catch (error) {
    deleteFiles(uploadedFiles);

    console.error("Vehicle creation error:", error);
    res.status(400).json({
      message: "Error creating vehicle",
      error: error.message || error,
    });
  }
};

module.exports = { createVehiclesSystem };
