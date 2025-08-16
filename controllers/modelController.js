const Model = require("../models/vehicleModel"); // Import Model schema

const getAllModels = async (req, res) => {
  try {
    const models = await Model.find();
    res.status(200).json({
      message: "Models fetched successfully",
      list: models,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllModels,
};
