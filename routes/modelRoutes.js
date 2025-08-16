const express = require("express");
const router = express.Router();
const { getAllModels } = require("../controllers/modelController");

router.get("/", getAllModels); // Get all vehicle models

module.exports = router;
