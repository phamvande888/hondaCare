const express = require("express");
const {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  changeStatus,
} = require("../controllers/branchController");
const upload = require("../middleware/uploadMiddleware"); // Import upload middleware
const router = express.Router();
const verifyToken = require("../middleware/verifyToken"); // Import token verification middleware
const checkrole = require("../middleware/checkRole"); // Import role checking middleware

// create new branch
router.post(
  "/create-branch",
  upload.array("images", 5),
  verifyToken,
  checkrole("Administrator"), // Only allow Administrator  create a branch
  createBranch
);

// get all branches
router.get("/get-all", getAllBranches);

// get branch by ID
router.get("/get-branch/:id", verifyToken, getBranchById);

// udpate branch
router.put(
  "/update-branch/:id",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  upload.array("images", 5),
  updateBranch
);

// change branch status to inactive
router.patch(
  "/changestatus-branch/:id",
  verifyToken,
  checkrole("Administrator", "Branch Manager"),
  changeStatus
);

module.exports = router;
