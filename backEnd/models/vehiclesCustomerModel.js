// models/VehiclesCustomer.js
const mongoose = require("mongoose");

const VehiclesCustomerSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    VehiclesSystemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehiclesSystem",
    },
    color: {
      type: String,
      default: null,
      trim: true,
    },
    mileage: {
      type: Number,
      default: 0,
      required: true,
    },
    lastMaintenanceDate: {
      type: Date,
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("VehiclesCustomer", VehiclesCustomerSchema);
