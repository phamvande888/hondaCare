const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // người đặt lịch là bắt buộc
    },
    service_id: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceSystem", // tham chiếu đến bảng dịch vụ hệ thống
        required: true,
      },
    dateTime: {
      type: Date,
      required: true, // thời gian đặt lịch
    },
    status: {
      type: String,
      enum: ["pending", "approved", "progress", "completed", "cancelled"],
      default: "pending",
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
      ref: "Branch", // chi nhánh thực hiện dịch vụ
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // người tạo đơn (có thể là admin)
      required: true,
    },
     created_type: {
      type: String,
      enum: ["Admin", "Customer"],
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } } // thêm thời gian tạo & cập nhật
);

module.exports = mongoose.model("Appointment", appointmentSchema);
