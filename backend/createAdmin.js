import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin.js";

dotenv.config();

console.log("Starting admin creation script...");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
    createAdmin();
  })
  .catch((err) => console.log("MongoDB connection error:", err));

async function createAdmin() {
  try {
    const existing = await Admin.findOne({
      email: "admin@example.com",
    });

    if (existing) {
      console.log("Admin already exists!");
      await mongoose.disconnect();
      return;
    }

    // Plain password here — the Admin model's pre-save hook hashes it once.
    const admin = new Admin({
      name: "Super Admin",
      email: "admin@example.com",
      password: "Admin@123",
      role: "admin",
    });

    await admin.save();

    console.log("Admin account created successfully!");
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    await mongoose.disconnect();
  }
}