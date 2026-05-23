const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/ProductModel");
const Category = require("./models/CategoryModel");

dotenv.config();

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing
        await Product.deleteMany();
        await Category.deleteMany();

        // Create categories
        const pastry = await Category.create({ name: "Pastry", description: "Flaky and sweet treats" });
        const muffin = await Category.create({ name: "Muffin", description: "Soft and fruity delights" });
        const bread = await Category.create({ name: "Bread", description: "Artisanal sourdough and rolls" });

        // Create products
        const products = [
            {
                name: "Classic Croissant",
                price: 3.50,
                image: "/images/hero_plate.png",
                rating: 4.9,
                reviewsCount: 156,
                category: pastry._id,
                description: "Pure butter flaky pastry"
            },
            {
                name: "Wildberry Muffin",
                price: 4.25,
                image: "/images/muffin.png",
                rating: 4.8,
                reviewsCount: 89,
                category: muffin._id,
                description: "Bursting with fresh berries"
            },
            {
                name: "Artisan Sourdough",
                price: 7.00,
                image: "/images/sourdough.png",
                rating: 5.0,
                reviewsCount: 210,
                category: bread._id,
                description: "24-hour slow fermentation"
            }
        ];

        await Product.insertMany(products);
        console.log("Database Seeded Successfully!");
        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedProducts();
