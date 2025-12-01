const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// ensure unique index on name
accessorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Accessory", accessorySchema);