const mongoose = require("mongoose");

const responsibilitySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. "manage_orders"
  description: { type: String, required: true } // e.g. "Can update order statuses"
});

module.exports = mongoose.model("Responsibility", responsibilitySchema);
