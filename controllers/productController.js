const Product = require("../models/ProductModel");
const { sendResponse } = require("../utils/helpers");

// Add product
exports.addProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      productData.images = req.files.map(file => `${baseUrl}/public/uploads/products/${file.filename}`);
    }

    const product = new Product(productData);
    await product.save();
    sendResponse(res, 201, true, "Product added successfully", product);
  } catch (err) {
    console.error("Error adding product:", err);
    sendResponse(res, 500, false, "Server error");
  }
};

// Get products
exports.getProducts = async (req, res) => {
  const products = await Product.find().populate("category");
  sendResponse(res, 200, true, "Products derived successfully", products);
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { existingImages, ...otherData } = req.body;
    const productData = { ...otherData };

    // Normalize existingImages to an array
    if (existingImages) {
      existingImages = Array.isArray(existingImages) ? existingImages : [existingImages];
    } else {
      existingImages = [];
    }

    let images = [...existingImages];

    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const newImages = req.files.map(file => `${baseUrl}/public/uploads/products/${file.filename}`);
      images = [...images, ...newImages];
    }

    productData.images = images;

    const product = await Product.findByIdAndUpdate(id, productData, { returnDocument: 'after' });
    sendResponse(res, 200, true, "Product updated successfully", product);
  } catch (err) {
    console.error("Error updating product:", err);
    sendResponse(res, 500, false, "Server error");
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, true, "Product deleted successfully");
};
