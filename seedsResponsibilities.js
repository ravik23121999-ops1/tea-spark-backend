const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Responsibility = require("./models/responsibilitiesModel");

dotenv.config();

const responsibilities = [
  { key: "manage_orders", description: "Can view and update order statuses" },
  { key: "manage_products", description: "Can create, update, and delete products" },
  { key: "manage_categories", description: "Can create, update, and delete categories" },
  { key: "view_reports", description: "Can access sales and performance reports" },
  { key: "handle_customers", description: "Can respond to customer queries and feedback" }
];

const seedResponsibilities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing responsibilities (optional)
    await Responsibility.deleteMany({});
    console.log("Cleared old responsibilities");

    // Insert new ones
    await Responsibility.insertMany(responsibilities);
    console.log("Responsibilities seeded successfully");

    process.exit();
  } catch (err) {
    console.error("Error seeding responsibilities:", err);
    process.exit(1);
  }
};

seedResponsibilities();
