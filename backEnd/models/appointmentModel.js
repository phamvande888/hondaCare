const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    service_id: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceSystem", 
        required: true,
      },
    dateTime: {
      type: Date,
      required: true, 
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    customer_note: {
      type: String,
      default: null,
      trim: true,
    },
    admin_note: {
      type: String,
      default: null,
      trim: true,
    },
    branch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch", 
      required: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } } // thêm thời gian tạo & cập nhật
);

module.exports = mongoose.model("Appointment", appointmentSchema);
