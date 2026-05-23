const Category = require("../models/CategoryModel");
const { sendResponse } = require("../utils/helpers");

// Add category
exports.addCategory = async (req, res) => {
  const category = new Category(req.body);
  await category.save();
  sendResponse(res, 201, true, "Category added successfully", category);
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    if (!categories || categories.length === 0) {
      return sendResponse(res, 404, false, "No categories found");
    }
    sendResponse(res, 200, true, "Categories found", categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    sendResponse(res, 500, false, "Server error");
  }
};


// Update category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
  sendResponse(res, 200, true, "Category updated successfully", category);
};

// Delete category
exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, true, "Category deleted successfully");
};
