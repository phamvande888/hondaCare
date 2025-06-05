const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true, // Ensures that phone numbers are unique across users
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimum length for password
    },
    role: {
      type: String,
      enum: [
        "Administrator",
        "Branch Manager",
        "Warehouse Staff",
        "Technician",
        "Service Receptionist",
        "Service Advisor",
        "Customer",
      ],
      default: "Customer",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    address: {
      type: String,
      default: null, // User's address
    },
    isActive: {
      type: Boolean,
      default: true, // Indicates if the user account is active
    },
    images: {
      type: [String], // Array of image URLs,
      default: ["https://example.com/default-profile.png"], // Default profile image URL
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch", // Reference to the Branch model
      required: true, // Ensures that a branch is associated with the user
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema); // This model defines the structure of the user document in MongoDB.
