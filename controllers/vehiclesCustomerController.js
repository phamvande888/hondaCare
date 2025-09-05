// controllers/vehiclesCustomerController.js
const VehiclesCustomer = require("../models/vehiclesCustomerModel");
const { checkMissingFields } = require("../utils/validators");
const VehiclesSystem = require("../models/vehiclesSystemModel");
const User = require("../models/usersModel");

const createVehiclesCustomer = async (req, res) => {
  try {
    const { licensePlate, VehiclesSystemId, color, mileage, customerId } =
      req.body;

    // check field
    const requiredFields = [
      "licensePlate",
      "VehiclesSystemId",
      "customerId",
      "color",
    ];
    const missingFields = checkMissingFields(req.body, requiredFields);

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missingFields.join(", ")}` });
    }

    // check licensePlate unique
    const existingVehicle = await VehiclesCustomer.findOne({
      licensePlate: licensePlate.trim(),
    });
    if (existingVehicle) {
      return res.status(400).json({ message: "License plate is existing" });
    }
    // valid VehiclesSystemId
    const validVehiclesSystemId = await VehiclesSystem.findById(
      VehiclesSystemId
    );
    if (!validVehiclesSystemId) {
      return res.status(400).json({ message: "VehiclesSystemId not found" });
    }
    // valid customerId
    const validCustomerId = await User.findById(customerId);
    if (!validCustomerId) {
      return res.status(400).json({ message: "Invalid customerId" });
    }
    //valid mileage
    if (mileage < 0) {
      return res
        .status(400)
        .json({ message: "Invalid mileage, must be a positive number" });
    }

    //create
    const newVehicle = new VehiclesCustomer({
      licensePlate: licensePlate.trim(),
      VehiclesSystemId,
      color: color,
      mileage: mileage ? parseInt(mileage) : 0,
      lastMaintenanceDate: new Date(), // default to now
      customerId,
    });

    await newVehicle.save();

    res.status(201).json({
      message: "Vehicle of customer  created successfully",
      data: newVehicle,
    });
  } catch (error) {
    console.error("Vehicle creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

// get list vehicles all customer for management
const getVehiclesAllCustomersList = async (req, res) => {
  try {
    const vehicles = await VehiclesCustomer.find()
      .populate({ path: "VehiclesSystemId", populate: { path: "model" } })
      .populate({ path: "customerId", select: "-password" });
    res.status(200).json({
      message: "List of vehicles of customers",
      total: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: error.message });
  }
};

// get detail vehicles customer
const getListVehiclesCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehiclesCustomer.find({ customerId: id })
      .populate({ path: "VehiclesSystemId", populate: { path: "model" } })
      .populate({ path: "customerId", select: "-password" });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json({
      message: `List of vehicles for customer ${id} `,
      total: vehicle.length,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ message: error.message });
  }
};

// get detail vehicle customer
const getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehiclesCustomer.findById(id)
      .populate({ path: "VehiclesSystemId", populate: { path: "model" } })
      .populate({ path: "customerId", select: "-password" });
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json({
      message: `Detail of vehicle ${id}`,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ message: error.message });
  }
};

// update vehicles customer
const updateVehiclesCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { licensePlate, VehiclesSystemId, color, mileage, customerId } =
      req.body;

    // check field
    const requiredFields = [
      "licensePlate",
      "VehiclesSystemId",
      "customerId",
      "color",
    ];
    const missingFields = checkMissingFields(req.body, requiredFields);

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing fields: ${missingFields.join(", ")}` });
    }

    // Check if vehicle exists
    const vehicle = await VehiclesCustomer.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // check licensePlate unique
    const existingVehicle = await VehiclesCustomer.findOne({
      licensePlate: licensePlate.trim(),
      _id: { $ne: id },
    });
    if (existingVehicle) {
      return res.status(400).json({ message: "License plate is existing" });
    }

    // valid VehiclesSystemId
    const validVehiclesSystemId = await VehiclesSystem.findById(
      VehiclesSystemId
    );
    if (!validVehiclesSystemId) {
      return res.status(400).json({ message: "VehiclesSystemId not found" });
    }

    // valid customerId
    const validCustomerId = await User.findById(customerId);
    if (!validCustomerId) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    // valid mileage
    if (mileage < 0) {
      return res
        .status(400)
        .json({ message: "Invalid mileage, must be a positive number" });
    }

    // update
    vehicle.licensePlate = licensePlate.trim();
    vehicle.VehiclesSystemId = VehiclesSystemId;
    vehicle.color = color;
    vehicle.mileage = mileage ? parseInt(mileage) : 0;
    vehicle.customerId = customerId;

    await vehicle.save();

    res.status(200).json({
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVehiclesCustomer,
  getVehiclesAllCustomersList,
  getListVehiclesCustomer,
  getListVehiclesCustomer,
  getDetail,
  updateVehiclesCustomer,
};
