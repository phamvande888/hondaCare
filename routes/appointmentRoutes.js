const express = require("express");
const router = express.Router();
const { adminCreateAppointment, customerCreateAppointment, updateAppointment,
    getAppointmentDetail, getAppointmentByCustomerId, getAllAppointments } = require("../controllers/appointmentController");
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware

//create appointment by staff
router.post("/", adminCreateAppointment, verifyToken);
router.post("/customer", customerCreateAppointment, verifyToken);
router.patch("/:id", verifyToken, updateAppointment);
router.get("/:id", verifyToken, getAppointmentDetail);
router.get("/list/:customer_id", verifyToken, getAppointmentByCustomerId);
router.get("/", verifyToken, getAllAppointments);

module.exports = router;