const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/authMiddleware");

router.post("/create", auth(["admin"]), categoryController.addCategory);
router.get("/get", categoryController.getCategories);
router.put("/update-category/:id", auth(["admin"]), categoryController.updateCategory);
router.delete("/delete/:id", auth(["admin"]), categoryController.deleteCategory);

module.exports = router;
