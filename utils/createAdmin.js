import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import UserSchema from "../models/user.js";

dotenv.config();

async function createAdmin(params) {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    const existingUser = await UserSchema.findOne({
      email: "paulowniaptz07@gmail.com",
    });
    if (existingUser) {
      console.log("Admin already exists");
      return process.exit(0);
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new UserSchema({
      email: process.env.ADMIN_EMAIL,
      fullName: process.env.ADMIN_NAME,
      passwordHash,
      role: "admin",
    });

    await admin.save();
    console.log("Admin created!");
    return process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
