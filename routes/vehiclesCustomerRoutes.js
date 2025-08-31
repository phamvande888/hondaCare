const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesCustomer,
  getVehiclesAllCustomersList,
  getVehiclesCustomerDetail,
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

// get list vehicles all customer for management
router.get(
  "/customers",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  getVehiclesAllCustomersList
);

// get detail vehicles customer
router.get(
  "/:id/customer",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  getVehiclesCustomerDetail
);

module.exports = router;
