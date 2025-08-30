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
      //   "mileage",
      //   "lastMaintenanceDate",
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
      return res.status(400).json({ message: "License plate must be unique" });
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
      message: "Vehicle created successfully",
      data: newVehicle,
    });
  } catch (error) {
    console.error("Vehicle creation error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createVehiclesCustomer };
