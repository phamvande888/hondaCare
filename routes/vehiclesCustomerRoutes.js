const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesCustomer,
  getVehiclesAllCustomersList,
  getListVehiclesCustomer,
  getDetail,
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
router.get("/customers", verifyToken, getVehiclesAllCustomersList);

// get list  vehicles customer
router.get("/:id/customer", verifyToken, getListVehiclesCustomer);

// get detail
router.get("/:id", verifyToken, getDetail);

module.exports = router;
