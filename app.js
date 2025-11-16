const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
// Load environment variables from .env file
dotenv.config();
const branchRoutes = require("./routes/branchRoutes"); // Import branch routes
const userRoutes = require("./routes/userRoutes"); // Import user routes
const authenRoutes = require("./routes/authRoutes"); // Import authentication routes
const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0occiax.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const serviceRoutes = require("./routes/serviceSystemRoutes");
const vehicleSystemRoutes = require("./routes/vehiclesSystemRoutes");
const modelRoutes = require("./routes/modelRoutes"); // Import model routes
const vehicleCustomersRoutes = require("./routes/vehiclesCustomerRoutes"); // Import model routes
const appointmentRoutes = require("./routes/appointmentRoutes"); // Import appointment routes

// Connect MongoDB Atlas
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅✅✅ MongoDB connected ✅✅✅"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use("/uploads", express.static("uploads")); // Serve static files from the uploads directory

//Routes API
app.use("/api/branches", branchRoutes);
app.use("/api/users", userRoutes); // routes for user management
app.use("/api/authentication", authenRoutes); // routes for user authentication
app.use("/api/services", serviceRoutes); // routes for user authentication
app.use("/api/vehicle-systems", vehicleSystemRoutes); // routes for vehicle management
app.use("/api/models", modelRoutes); // routes for vehicle management
app.use("/api/vehicle-customers", vehicleCustomersRoutes); // routes for vehicle of customer management
app.use("/api/appoinment", appointmentRoutes); // routes for appointment management

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
Server is running on http://localhost:${PORT}`);
});
