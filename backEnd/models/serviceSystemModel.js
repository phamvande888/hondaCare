// models/ServiceSystem.js
const mongoose = require("mongoose");

const ServiceSystemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
      min: [0, "Price must be a non-negative number"],
    },
    // hours
    estimatedTime: {
      type: Number,
      default: 0,
      required: true,
      min: [0, "Estimated time must be a non-negative number"],
    },
    images: {
      type: [String],
      default: null,
      trim: true, // Array of image URLs
    },
    category: {
      type: String,
      enum: ["maintenance", "repair", "check"],
      required: true,
    },
    branches: [
      {
        branch: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Branch",
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true, //  createdAt and  updatedAt
  }
);

module.exports = mongoose.model("ServiceSystem", ServiceSystemSchema);
