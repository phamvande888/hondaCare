const User = require("../models/usersModel");
const { checkMissingFields } = require("../utils/validators");
const Appointment = require("../models/appointmentModel");

// Admin create Appointment
const adminCreateAppointment = async (req, res) => {
  try {
    const {
      customer_id,
      service_id,
      dateTime,
      branch_id,
      admin_note,
      customer_note,
      created_by,
    } = req.body;

    // Define required fields for admin creation
    const requiredFields = [
      "customer_id",
      "service_id",
      "dateTime",
      "branch_id",
      "created_by",
    ];

    // Check for missing fields
    const missingFields = checkMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Optional: validate customer exists
    const customer = await User.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    //valid id admin
    const admin = await User.findById(created_by);

    if (!admin) {
      return res.status(404).json({ error: "admin not found" });
    }

    // Validate dateTime is not in the past
    const appointmentTime = new Date(dateTime);
    const now = new Date();
    if (appointmentTime < now) {
      return res
        .status(400)
        .json({ error: "Appointment dateTime cannot be in the past" });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      customer_id,
      service_id,
      branch_id: branch_id,
      dateTime,
      admin_note: admin_note || null,
      customer_note: customer_note || null,
      created_by: admin._id,
    });
    return res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Customer create Appointment
const customerCreateAppointment = async (req, res) => {
  try {
    const {
      service_id,
      dateTime,
      branch_id,
      customer_note,
      customer_id, //
    } = req.body;

    // Required fields
    const requiredFields = [
      "customer_id",
      "service_id",
      "dateTime",
      "branch_id",
    ];
    const missingFields = checkMissingFields(req.body, requiredFields);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Validate customer exists
    const customer = await User.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Validate dateTime is not in the past
    const appointmentTime = new Date(dateTime);
    const now = new Date();
    if (appointmentTime < now) {
      return res
        .status(400)
        .json({ error: "Appointment dateTime cannot be in the past" });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      customer_id,
      service_id,
      branch_id,
      dateTime: appointmentTime,
      admin_note: null, //
      customer_note: customer_note || null,
      created_by: customer._id,
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params; //
    const { dateTime, admin_note, customer_note, branch_id, status } = req.body;

    // Validate appointment exists
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Validate dateTime
    if (dateTime) {
      const newDate = new Date(dateTime);
      if (newDate < new Date()) {
        return res
          .status(400)
          .json({ error: "Appointment dateTime cannot be in the past" });
      }
      appointment.dateTime = newDate;
    }

    // Cập nhật các trường khác nếu có
    if (admin_note !== undefined) appointment.admin_note = admin_note;
    if (customer_note !== undefined) appointment.customer_note = customer_note;
    if (branch_id !== undefined) appointment.branch_id = branch_id;
    if (status !== undefined) appointment.status = status;

    // Lưu thay đổi
    await appointment.save();
    return res.status(200).json({
      message: `Appointment with id: ${appointment._id} updated successfully`,
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get appointment detail
const getAppointmentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm appointment theo id và populate thông tin customer + created_by
    const appointment = await Appointment.findById(id)
      .populate("customer_id", "fullName phoneNumber email gender address images") // thông tin cơ bản của khách
      .populate("created_by", "fullName role phoneNumber images")  // thông tin cơ bản của người tạo
      .populate("service_id", "name price estimatedTime images category")  // thông tin cơ bản của người tạo
      .populate("branch_id", "name address phoneNumber images email images");  // thông tin cơ bản của người tạo

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Get appointment list by customer id
const getAppointmentByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Tìm appointment theo id và populate thông tin customer + created_by
    const appointment = await Appointment.find({ customer_id: customer_id })
      .populate("customer_id", "fullName phoneNumber email gender address images") // thông tin cơ bản của khách
      .populate("created_by", "fullName role phoneNumber images")  // thông tin cơ bản của người tạo
      .populate("service_id", "name price estimatedTime images category")  // thông tin cơ bản của người tạo
      .populate("branch_id", "name address phoneNumber images email images");  // thông tin cơ bản của người tạo

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json({ message: `Found ${appointment.length} appointments`, appointments: appointment });
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return res.status(500).json({ error: error.message });
  }
};

// getall appointment
const getAllAppointments = async (req, res) => {
  try {
    const appointment = await Appointment.find()
      .populate("customer_id", "fullName phoneNumber email gender address images") // thông tin cơ bản của khách
      .populate("created_by", "fullName role phoneNumber images")  // thông tin cơ bản của người tạo
      .populate("service_id", "name price estimatedTime images category")  // thông tin cơ bản của người tạo
      .populate("branch_id", "name address phoneNumber images email images");  // thông tin cơ bản của người tạo

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json({ message: `Found ${appointment.length} appointments`, appointments: appointment });
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  adminCreateAppointment,
  customerCreateAppointment,
  updateAppointment,
  getAppointmentDetail,
  getAppointmentByCustomerId,
  getAllAppointments
};
