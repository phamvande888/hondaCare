const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createUser,
  updateProfile,
  changeAccountStatus,
} = require("../controllers/userController");

router.post("/create-user", upload.array("images", 5), createUser); // Create a new user with image upload
router.put("/update-profile/:id", upload.array("images", 5), updateProfile); // Update user profile with image upload
router.patch("/update-account-status/:id", changeAccountStatus); // Change user status (active/inactive)

module.exports = router;
