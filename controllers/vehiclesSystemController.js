// controllers/VehiclesSystemController.js
const fs = require("fs");
const path = require("path");
const VehiclesSystem = require("../models/vehiclesSystemModel");
const { deleteFiles } = require("../utils/fileHelper");
const { checkMissingFields } = require("../utils/validators");
const Model = require("../models/vehicleModel");

// create VehiclesSystem
const createVehiclesSystem = async (req, res) => {
  const uploadedFiles = [
    ...(req.files?.avatar?.map((f) => f.filename) || []),
    ...(req.files?.images?.map((f) => f.filename) || []),
  ];

  try {
    // get vehicle data from request body
    const name = req.body.name?.trim();
    const model = req.body.model?.trim();
    const description = req.body.description?.trim() || null;
    const year = req.body.year ? parseInt(req.body.year) : null;
    const price = req.body.price ? parseFloat(req.body.price) : null;
    const avatar = req.files?.avatar ? req.files.avatar[0].filename : null;
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

    // exist name + model (ex: Civic 1.5 Turbo existing)
    const existingVehicle = await VehiclesSystem.findOne({ name, model });
    if (existingVehicle) {
      deleteFiles(uploadedFiles);
      return res.status(409).json({
        error: `Vehicle ${name} - ${model} already exists.`,
      });
    }

    // check model existing
    const existingModel = await Model.findById(model);
    if (!existingModel) {
      deleteFiles(uploadedFiles);
      return res.status(404).json({
        error: `Model ${model} not found.`,
      });
    }
    // Validate images (at least 1 image)
    if (!images || images.length === 0) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({
        error: "At least one image is required",
      });
    }

    // create data
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
