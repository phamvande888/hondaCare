const express = require("express");
const router = express.Router();
const { adminCreateAppointment, customerCreateAppointment, updateAppointment,
    getAppointmentDetail, getAppointmentByCustomerId, getAllAppointments } = require("../controllers/appointmentController");
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkRole = require("../middleware/checkRole");

//create appointment by staff
router.post("/", verifyToken, checkRole(["Administrator", "Branch Manager", "Service Receptionist"]), adminCreateAppointment);
router.post("/customer", verifyToken, customerCreateAppointment);
router.patch("/:id", verifyToken, updateAppointment);
router.get("/list/:customer_id", verifyToken, getAppointmentByCustomerId);
router.get("/", verifyToken, checkRole(["Administrator", "Branch Manager", "Service Receptionist"]), getAllAppointments);
router.get("/:id", verifyToken, getAppointmentDetail);

module.exports = router;