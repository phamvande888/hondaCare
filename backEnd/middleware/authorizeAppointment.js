const Appointment = require("../models/appointmentModel");

const staffRoles = ["Administrator", "Branch Manager", "Service Receptionist"];

const authorizeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const isOwner = appointment.customer_id.toString() === req.user.userId;
    const isStaff = staffRoles.includes(req.user.role);
    if (!isOwner && !isStaff) return res.status(403).json({ error: "Forbidden" });

    if (req.method === "PATCH" && !isStaff) {
      const fields = Object.keys(req.body);
      if (fields.length !== 1 || req.body.status !== "Cancelled") {
        return res.status(403).json({
          error: "Customers can only cancel their own pending appointments",
        });
      }
      if (appointment.status !== "Pending") {
        return res.status(409).json({ error: "Only pending appointments can be cancelled" });
      }
    }

    req.appointment = appointment;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid appointment ID" });
  }
};

module.exports = authorizeAppointment;