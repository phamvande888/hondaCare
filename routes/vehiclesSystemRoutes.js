const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesSystem,
} = require("../controllers/vehiclesSystemController");
const { model } = require("mongoose");
//create vehicle system
router.post(
  "/create",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  createVehiclesSystem
);

module.exports = router;
