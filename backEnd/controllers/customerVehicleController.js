const VehiclesCustomer = require("../models/vehiclesCustomerModel");
const VehiclesSystem = require("../models/vehiclesSystemModel");

const normalizeLicensePlate = (value) => value.trim().toUpperCase().replace(/\s+/g, "");

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await VehiclesCustomer.find({
      customerId: req.user.userId,
      isActive: { $ne: false },
    })
      .populate({ path: "VehiclesSystemId", populate: { path: "model" } })
      .sort({ createdAt: -1 });
    return res.status(200).json({ total: vehicles.length, data: vehicles });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

const createMyVehicle = async (req, res) => {
  try {
    const licensePlate = req.body.licensePlate?.trim();
    const VehiclesSystemId = req.body.VehiclesSystemId?.trim();
    const color = req.body.color?.trim();
    const mileage = Number(req.body.mileage ?? 0);

    if (!licensePlate || !VehiclesSystemId || !color) {
      return res.status(400).json({ message: "licensePlate, VehiclesSystemId and color are required" });
    }
    if (!Number.isFinite(mileage) || mileage < 0) {
      return res.status(400).json({ message: "Mileage must be a non-negative number" });
    }

    const normalizedPlate = normalizeLicensePlate(licensePlate);
    if (!/^[0-9A-Z.-]{5,12}$/.test(normalizedPlate)) {
      return res.status(400).json({ message: "Invalid license plate format" });
    }
    if (await VehiclesCustomer.exists({ licensePlate: normalizedPlate })) {
      return res.status(409).json({ message: "License plate already exists" });
    }

    const vehicleSystem = await VehiclesSystem.findOne({
      _id: VehiclesSystemId,
      isActive: { $ne: false },
    });
    if (!vehicleSystem) {
      return res.status(404).json({ message: "Active vehicle model not found" });
    }

    const vehicle = await VehiclesCustomer.create({
      licensePlate: normalizedPlate,
      VehiclesSystemId,
      color,
      mileage,
      customerId: req.user.userId,
      lastMaintenanceDate: null,
    });
    await vehicle.populate({ path: "VehiclesSystemId", populate: { path: "model" } });
    return res.status(201).json({ message: "Vehicle created successfully", data: vehicle });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "License plate already exists" });
    if (error?.name === "CastError") return res.status(400).json({ message: "Invalid vehicle model ID" });
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = { getMyVehicles, createMyVehicle };