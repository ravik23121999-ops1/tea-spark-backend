const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", staffController.register);
router.post("/login", staffController.login);

// Profile routes
router.get("/profile", authMiddleware(["staff"]), staffController.getProfile);
router.put("/profile", authMiddleware(["staff"]), staffController.updateProfile);

module.exports = router;
