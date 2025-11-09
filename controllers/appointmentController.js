const User = require("../models/usersModel");
const { checkMissingFields } = require("../utils/validators");
const Appointment = require("../models/appointmentModel");

// Admin create Appointment
const adminCreateAppointment = async (req, res) => {
  try {
    const { customer_id, service_id, dateTime, branch_id, admin_note, customer_note } = req.body;
    const admin_id = req.user._id; // từ token admin

    // Define required fields for admin creation
    const requiredFields = ["customer_id", "service_id", "dateTime"];

    // Check for missing fields
    const missingFields = checkMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    // Optional: validate customer exists
    const customer = await User.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      customer_id,
      service_id,
      branch_id: branch_id || null,
      dateTime,
      admin_note: admin_note || null,
      customer_note: customer_note || null,
      created_by: admin_id,
      created_type: "Admin" // match schema enum
    });

    return res.status(201).json(appointment);

  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  adminCreateAppointment,
};
