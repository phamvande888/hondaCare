const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware
const {
  createServiceSystem,
  updateServiceSystem,
  updateStatus,
} = require("../controllers/serviceSystemController");

//  Administrator - Branch Manager : create service
router.post(
  "/create-service",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  upload.array("images", 5),
  createServiceSystem
);

//  Administrator - Branch Manager : create service
router.put(
  "/update-service/:id",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  upload.array("images", 5),
  updateServiceSystem
);

// Administrator - Branch Manager: update status
router.patch(
  "/:serviceSystemId/branches/:branchId/status",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  updateStatus
);

module.exports = router;
