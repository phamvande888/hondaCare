const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesSystem,
  updateVehiclesSystem,
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

// Update vehicle system
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
module.exports = router;
