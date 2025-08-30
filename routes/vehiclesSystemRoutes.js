const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesSystem,
  updateVehiclesSystem,
  updateIsActive,
  getAll,
  getById,
  getByModel,
} = require("../controllers/vehiclesSystemController");
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware

//create vehicle system
router.post(
  "/",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createVehiclesSystem
);

// Update information vehicle system
router.put(
  "/:id",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  updateVehiclesSystem
);

// Update vehicle system status (IsActive: boolean)
router.patch(
  "/:id/status",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  updateIsActive
);

// List vehicle systems
router.get("/", getAll);

// Get vehicle system by ID (detail)
router.get("/:id", getById);

// Get by model
router.get("/model/:modelId", getByModel);

module.exports = router;
