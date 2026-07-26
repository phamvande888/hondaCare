const VehiclesCustomer = require("../models/vehiclesCustomerModel");

const staffRoles = ["Administrator", "Branch Manager"];
const isStaff = (req) => staffRoles.includes(req.user.role);

const authorizeCustomerVehicleList = (req, res, next) => {
  if (req.params.id === req.user.userId || isStaff(req)) return next();
  return res.status(403).json({ message: "Forbidden" });
};

const authorizeCustomerVehicle = async (req, res, next) => {
  try {
    const vehicle = await VehiclesCustomer.findById(req.params.id).select("customerId");
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (req.method === "PUT" && !isStaff(req)) {
      return res.status(403).json({ message: "Only staff can update vehicle records" });
    }
    if (vehicle.customerId.toString() !== req.user.userId && !isStaff(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.customerVehicle = vehicle;
    return next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid vehicle ID" });
  }
};

module.exports = { authorizeCustomerVehicleList, authorizeCustomerVehicle };