const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // linked category
  price: Number,
  images: { type: [String], default: [] },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  description: String,
  availability: { type: Boolean, default: true }
});

module.exports = mongoose.model("Product", productSchema);
