const Admin = require("../models/AdminModel");
const Staff = require("../models/StaffModel");
const Responsibility = require("../models/responsibilitiesModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { approvalStatusNotice } = require("../utils/emailTemplates");
const { sendResponse, getPaginatedData } = require("../utils/helpers");

// Admin login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
  if (!admin) return sendResponse(res, 404, false, "Admin not found");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return sendResponse(res, 400, false, "Invalid credentials");

  const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  sendResponse(res, 200, true, "Login successful", { token, email: admin.email, role: admin.role });
};

// View pending staff
exports.getPendingStaff = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const paginatedResult = await getPaginatedData(Staff, { status: "pending" }, page, limit);
    sendResponse(res, 200, true, "Pending staff found", paginatedResult);
  } catch (err) {
    console.error("Error fetching pending staff:", err);
    sendResponse(res, 500, false, "Server error");
  }
};
// Get approved staff
exports.getApprovedStaff = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const paginatedResult = await getPaginatedData(Staff, { status: "approved" }, page, limit, ["responsibilities"]);
    sendResponse(res, 200, true, "Approved staff found", paginatedResult);
  } catch (err) {
    console.error("Error fetching approved staff:", err);
    sendResponse(res, 500, false, "Server error");
  }
};

// Approve/reject staff
exports.approveStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const staff = await Staff.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!staff) return sendResponse(res, 404, false, "Staff not found");

    if (staff.email) {
      const emailHtml = approvalStatusNotice(staff.name, status);
      await sendEmail(staff.email, "Staff Approval Update", `Your account has been ${status} by the admin.`, emailHtml);
    }

    sendResponse(res, 200, true, "Staff status updated successfully", staff);
  } catch (err) {
    console.error("Error approving staff:", err);
    sendResponse(res, 500, false, "Server error");
  }
};
exports.getResponsibilities = async (req, res) => {
  const responsibilities = await Responsibility.find();
  sendResponse(res, 200, true, "Responsibilities found", responsibilities);
};
// Assign responsibilities
exports.assignResponsibilities = async (req, res) => {
  try {
    const { id } = req.params;
    const { responsibilityIds } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      id,
      { responsibilities: responsibilityIds },
      { new: true }
    ).populate("responsibilities");

    if (!staff) return sendResponse(res, 404, false, "Staff not found");

    sendResponse(res, 200, true, "Responsibilities assigned successfully", staff);
  } catch (err) {
    console.error("Error assigning responsibilities:", err);
    sendResponse(res, 500, false, "Server error");
  }
};

// Remove a single responsibility
exports.removeResponsibility = async (req, res) => {
  try {
    const { id, respId } = req.params;

    const staff = await Staff.findByIdAndUpdate(
      id,
      { $pull: { responsibilities: respId } },
      { new: true }
    ).populate("responsibilities");

    if (!staff) return sendResponse(res, 404, false, "Staff not found");

    sendResponse(res, 200, true, "Responsibility removed successfully", staff);
  } catch (err) {
    console.error("Error removing responsibility:", err);
    sendResponse(res, 500, false, "Server error");
  }
};
