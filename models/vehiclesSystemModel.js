// models/VehiclesSystem.js
const mongoose = require("mongoose");

const VehiclesSystemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, //ex: Civic, CR-V
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model", // Reference to Model collection
      required: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
      required: true, // Optional description
    },
    year: {
      type: Number,
      min: [1886, "Invalid year"],
      require: true,
      trim: true, // Year of manufacture
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    images: {
      type: [String], // array link images
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"], // always positive number
    },
  },
  // create and update timestamps
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VehiclesSystem", VehiclesSystemSchema);
