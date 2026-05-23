const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://tea-spark-frontend.vercel.app'
  ],
  credentials: true
}));
app.use("/public", express.static("public"));

// Other routes (admin, staff, products, categories)
app.use("/api/admin", require("./routes/adminRoute"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/products", require("./routes/productRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));
const chatRoute = require("./routes/chatRoute");
app.use("/api/chat", chatRoute);
app.use("/chat", chatRoute); // alias for clients/docs using /chat/*
app.use("/api/cart", require("./routes/cartRoute"));
app.use("/api/orders", require("./routes/orderRoute"));
app.use("/api/password", require("./routes/passwordRoute"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
