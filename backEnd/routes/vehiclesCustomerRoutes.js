const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createVehiclesCustomer,
  getVehiclesAllCustomersList,
  getListVehiclesCustomer,
  getDetail,
  updateVehiclesCustomer,
} = require("../controllers/vehiclesCustomerController");
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware
const { getMyVehicles, createMyVehicle } = require("../controllers/customerVehicleController");
const { authorizeCustomerVehicleList, authorizeCustomerVehicle } = require("../middleware/authorizeCustomerVehicle");

router.get("/mine", verifyToken, getMyVehicles);
router.post("/mine", verifyToken, createMyVehicle);

//create vehicle system
router.post(
  "/",
  verifyToken,
  checkrole(["Administrator", "Branch Manager"]),
  createVehiclesCustomer
);

// get list vehicles all customer for management
router.get("/customers", verifyToken, checkrole(["Administrator", "Branch Manager"]), getVehiclesAllCustomersList);

// get list  vehicles customer
router.get("/:id/customer", verifyToken, authorizeCustomerVehicleList, getListVehiclesCustomer);

// get detail
router.get("/:id", verifyToken, authorizeCustomerVehicle, getDetail);

// update
router.put("/:id", verifyToken, authorizeCustomerVehicle, updateVehiclesCustomer);

module.exports = router;
