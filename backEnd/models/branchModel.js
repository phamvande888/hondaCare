const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ensures that branch names are unique
    },
    address: {
      type: String,
      required: true, // Branch address is required
    },
    phoneNumber: {
      type: String,
      required: true, // Branch phone number is required
      unique: true, // Ensures that phone numbers are unique across branches
    },
    email: {
      type: String,
      required: true, // Branch email is required
      unique: true, // Ensures that emails are unique across branches
    },
    isActive: {
      type: Boolean,
      default: true, // Indicates if the branch is active
    },
    images: {
      type: [String], // Array of image URLs for branch images
      default: ["https://example.com/default-branch-image.png"], // Default image URL
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt timestamps
);

module.exports = mongoose.model("Branch", branchSchema);
