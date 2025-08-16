const mongoose = require("mongoose");

const ModelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Civic, City, HR-V
});

module.exports = mongoose.model("Model", ModelSchema);
