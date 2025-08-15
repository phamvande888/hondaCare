const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
// Load environment variables from .env file
dotenv.config();
const branchRouter = require("./routes/branchRoutes"); // Import branch routes
const userRouter = require("./routes/userRoutes"); // Import user routes
const authenRouter = require("./routes/authRoutes"); // Import authentication routes
const MONGO_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0occiax.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const serviceRouter = require("./routes/serviceSystemRoutes");
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
//Routes admin
app.use("/management-branch", branchRouter);
app.use("/management-user", userRouter); // routes for user management
app.use("/authentication", authenRouter); // routes for user authentication
app.use("/management-service", serviceRouter); // routes for user authentication

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
Server is running on http://localhost:${PORT}`);
});
