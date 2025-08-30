const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesCustomer,
} = require("../controllers/vehiclesCustomerController");
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware

//create vehicle system
router.post(
  "/",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  createVehiclesCustomer
);

module.exports = router;
