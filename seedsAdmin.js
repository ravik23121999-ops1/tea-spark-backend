const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/AdminModel");
require("dotenv").config();

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await Admin.findOne({ email: "kashyapsanam2001@gmail.com" });
  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin12345", 10);

  const admin = new Admin({
    email: "kashyapsanam2001@gmail.com",
    password: hashedPassword,
    role: "admin"
  });

  await admin.save();
  console.log("Admin created successfully");
  process.exit();
};

seedAdmin();
