const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const { createUser } = require("../controllers/userController");

router.post("/create-user", upload.array("images", 5), createUser); // Create a new user with image upload

module.exports = router;
