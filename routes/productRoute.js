const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/", auth(["admin"]), upload.array('images', 5), productController.addProduct);
router.get("/", productController.getProducts);
router.patch("/:id", auth(["admin"]), upload.array('images', 5), productController.updateProduct);
router.delete("/:id", auth(["admin"]), productController.deleteProduct);

module.exports = router;
