const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

router.post("/login", adminController.login);
router.get("/pending-staff", auth(["admin"]), adminController.getPendingStaff);
router.get("/approved-staff", auth(["admin"]), adminController.getApprovedStaff);
console.log("adminController:", adminController);
router.patch("/update-staff-status/:id/approve", auth(["admin"]), adminController.approveStaff);
router.get("/get-responsibilities", auth(["admin"]), adminController.getResponsibilities);
router.patch("/staff-responsibilities/:id/assign", auth(["admin"]), adminController.assignResponsibilities);
router.patch("/staff/:id/responsibility/:respId/remove", auth(["admin"]), adminController.removeResponsibility);

module.exports = router;
