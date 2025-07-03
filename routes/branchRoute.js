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

router.post(
  "/create-branch",
  upload.array("images", 5),
  verifyToken,
  checkrole("Administrator"), // Only allow Administrator  create a branch
  createBranch
); // create new branch

router.get("/get-all", getAllBranches); // get all branches

router.get("/get-branch/:id", getBranchById); // get branch by ID

router.put("/update-branch/:id", upload.array("images", 5), updateBranch); // udpate branch

router.patch("/changestatus-branch/:id", changeStatus); // change branch status to inactive

module.exports = router;
