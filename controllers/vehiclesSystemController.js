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

// update VehiclesSystem
const updateVehiclesSystem = async (req, res) => {
  const vehicleId = req.params.id;
  const uploadedFiles = [
    ...(req.files?.avatar?.map((f) => f.filename) || []),
    ...(req.files?.images?.map((f) => f.filename) || []),
  ];

  try {
    // Find existing vehicle
    const vehicle = await VehiclesSystem.findById(vehicleId);
    if (!vehicle) {
      deleteFiles(uploadedFiles);
      return res.status(404).json({ error: "Vehicle not found" });
    }

    // Extract request body
    const { name, model, description, year, price } = req.body;

    // Validate year if provided
    if (year && parseInt(year) < 1886) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({ error: "Invalid year of manufacture" });
    }

    // Validate price if provided
    if (price && parseFloat(price) < 0) {
      deleteFiles(uploadedFiles);
      return res.status(400).json({ error: "Price must be a positive number" });
    }

    // If model provided, check it exists
    if (model) {
      const existingModel = await Model.findById(model.trim());
      if (!existingModel) {
        deleteFiles(uploadedFiles);
        return res.status(404).json({
          error: `Model ${model} not found.`,
        });
      }
    }

    // If avatar uploaded, replace old one
    let newAvatar = vehicle.avatar;
    if (req.files?.avatar) {
      if (vehicle.avatar) {
        deleteFiles([vehicle.avatar]); // delete old avatar
      }
      newAvatar = req.files.avatar[0].filename;
    }

    // If new images uploaded, replace existing ones (or you can choose to append)
    let newImages = vehicle.images || [];
    if (req.files?.images && req.files.images.length > 0) {
      deleteFiles(vehicle.images); // delete old images
      newImages = req.files.images.map((f) => f.filename);
    }

    // Update vehicle fields
    vehicle.name = name?.trim() || vehicle.name;
    vehicle.model = model?.trim() || vehicle.model;
    vehicle.description = description?.trim() || vehicle.description;
    vehicle.year = year ? parseInt(year) : vehicle.year;
    vehicle.price = price ? parseFloat(price) : vehicle.price;
    vehicle.avatar = newAvatar;
    vehicle.images = newImages;

    await vehicle.save();

    res.status(200).json({
      message: "Vehicle updated successfully",
      updated_vehicle: vehicle,
    });
  } catch (error) {
    deleteFiles(uploadedFiles);
    console.error("Vehicle update error:", error);
    res.status(400).json({
      message: "Error updating vehicle",
      error: error.message || error,
    });
  }
};

module.exports = { createVehiclesSystem, updateVehiclesSystem };
