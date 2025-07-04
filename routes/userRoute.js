const express = require("express");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const {
  createUser,
  updateProfile,
  changeAccountStatus,
  getUserProfile,
  getListCustomers,
  getListBranchManager,
  getListWarehouseStaff,
  getListWarehouseStaffByBranch,
  getListTechnician,
  getListTechnicianByBranch,
} = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware

router.post(
  "/create-user",
  verifyToken,
  checkrole(["Administrator", "Branch Manager"]),
  upload.array("images", 5),
  createUser
); // Administrator Branch Manager Create a new user with image upload

router.put(
  "/update-profile/:id",
  verifyToken,
  upload.array("images", 5),
  updateProfile
); // user Update  profile with image upload

router.patch(
  "/update-account-status/:id",
  verifyToken,
  checkrole(["Administrator", "Branch Manager"]),
  changeAccountStatus
); // Administrator - Branch Manager Change user status (active/inactive)

router.get("/get-user-profile/:id", verifyToken, getUserProfile); // all user - Get user profile by ID

router.get(
  "/list-customers",
  verifyToken,
  checkrole(["Administrator", "Branch Manager"]),
  getListCustomers
); // Administrator-Branch Manager List all users (uncomment if needed)

router.get(
  "/list-branch-manager",
  verifyToken,
  checkrole(["Administrator"]),
  getListBranchManager
); // Administrator List all branch managers

router.get(
  "/list-warehouse-staff",
  verifyToken,
  checkrole(["Administrator"]),
  getListWarehouseStaff
); // Administrator List all warehouse staff

router.get(
  "/list-warehouse-staff/by-branch/:branchId",
  verifyToken,
  checkrole(["Administrator", "Branch Manager"]),
  getListWarehouseStaffByBranch
); // Administrator - Branch Manager : get List all warehouse staff by branch

router.get(
  "/list-technician",
  verifyToken,
  checkrole(["Administrator"]),
  getListTechnician
); // Administrator List all technicians

router.get(
  "/list-technician/by-branch/:branchId",
  verifyToken,
  checkrole(["Administrator", "Branch Manager"]),
  getListTechnicianByBranch
); // Administrator - Branch Manager : get List all technicians by branch

module.exports = router;
