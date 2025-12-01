const express = require("express");
const router = express.Router();
const {
  createAccessory,
  getAllAccessories,
  getAccessoryById,
  updateAccessory,
  updateIsActive,
  deleteAccessory,
} = require("../controllers/accessoryController");
const verifyToken = require("../middleware/verifyToken");
const checkrole = require("../middleware/checkRole");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware

// Create accessory (protected) ✅
router.post(
  "/",
  verifyToken,
  upload.array("images", 5),
  checkrole("Administrator", "Branch Manager"),
  createAccessory
);

// Update accessory (protected)✅
router.put(
  "/:id",
  verifyToken,
  upload.array("images", 5),
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  updateAccessory
);

// Update isActive status (protected) ✅
router.patch(
  "/:id/status",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  updateIsActive
);

// // Delete accessory (protected)
// router.delete(
//   "/:id",
//   verifyToken,
//   checkrole("Administrator", "Branch Manager"),
//   deleteAccessory
// );

// List accessories ✅
router.get("/", getAllAccessories);

// Get accessory by id ✅
router.get("/:id", getAccessoryById);

module.exports = router;
