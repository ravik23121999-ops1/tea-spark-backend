const Staff = require("../models/StaffModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { registrationAdminNotice } = require("../utils/emailTemplates");
const { sendResponse } = require("../utils/helpers");

// Staff register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailHtml = registrationAdminNotice(name, email);
  await sendEmail("kashyapsanam2001@gmail.com", "New Staff Registration", `Staff ${name} (${email}) has registered.`, emailHtml);
  const existingStaff = await Staff.findOne({ email });
  if (existingStaff) {
    return sendResponse(res, 400, false, "Email already registered");
  }

  const staff = new Staff({ name, email, password });
  await staff.save();
  sendResponse(res, 201, true, "Staff registered, awaiting admin approval", { staffId: staff._id, name: staff.name, email: staff.email, status: staff.status });
};


// Staff login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const staff = await Staff.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') }).populate("responsibilities");
  if (!staff) return sendResponse(res, 404, false, "Staff not found");
  if (staff.status !== "approved") return sendResponse(res, 403, false, "Not approved by admin");

  const isMatch = await bcrypt.compare(password, staff.password);
  if (!isMatch) return sendResponse(res, 400, false, "Invalid credentials");

  const token = jwt.sign({ id: staff._id, role: "staff" }, process.env.JWT_SECRET, { expiresIn: "1d" });
  sendResponse(res, 200, true, "Login successful", { token, responsibilities: staff.responsibilities, email: staff.email, role: 'staff' });
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id).populate("responsibilities");
    if (!staff) return sendResponse(res, 404, false, "Staff not found");
    sendResponse(res, 200, true, "Profile fetched", staff);
  } catch (err) {
    sendResponse(res, 500, false, "Server error");
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updateData = { name, email };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const staff = await Staff.findByIdAndUpdate(req.user.id, updateData, { returnDocument: 'after' }).populate("responsibilities");
    sendResponse(res, 200, true, "Profile updated successfully", staff);
  } catch (err) {
    console.error("Profile update error:", err);
    sendResponse(res, 500, false, "Server error");
  }
};
