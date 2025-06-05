const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
// Load environment variables from .env file
dotenv.config();
const branchRouter = require("./routes/branchRoute"); // Import branch routes
const userRouter = require("./routes/userRoute"); // Import user routes
// Connect MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
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
app.use("/management-user", userRouter); // Import user routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
Server is running on http://localhost:${PORT}`);
});
