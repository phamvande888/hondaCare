const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesSystem,
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

module.exports = router;
