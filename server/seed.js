// seed.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "./models/Category.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

const seedCategories = async () => {
  await connectDB();

  const categories = [
    { name: "Entertainment" },
    { name: "History" },
    { name: "Technology" },
    { name: "Sports" },
    { name: "Education" },
    { name: "Politics" },
  ];

  try {
    // Clear existing categories
    await Category.deleteMany();
    console.log("🧹 Existing categories cleared");

    // Save each category individually so the slug hook runs
    for (const cat of categories) {
      const category = new Category(cat);
      await category.save();
      console.log(`✅ Saved category: ${category.name} (${category.slug})`);
    }

    console.log("🌱 All categories seeded successfully!");

    // Close DB connection
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    process.exit(1);
  }
};

// Run seeder
seedCategories();
