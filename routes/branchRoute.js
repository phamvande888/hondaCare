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

router.post("/create-branch", upload.array("images", 5), createBranch); // create new branch
router.get("/get-all", getAllBranches); // get all branches
router.get("/get-branch/:id", getBranchById); // get branch by ID
router.put("/update-branch/:id", upload.array("images", 5), updateBranch); // udpate branch
router.patch("/changestatus-branch/:id", changeStatus); // change branch status to inactive

module.exports = router;
