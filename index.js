import express from "express";
import cors from "cors";
import path from "path"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import mongoose from "mongoose";

import { registerValidation } from "./validations/auth.js";
import { loginValidation } from "./validations/login.js";

import { checkAuth } from "./utils/checkAuth.js";
import {
  register,
  login,
  getMe,
  logout,
} from "./controllers/userController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./controllers/categoryController.js";
import {
  createTree,
  deleteTree,
  getAllTrees,
  updateTree,
} from "./controllers/treeController.js";
import { uploadImage } from "./controllers/uploadController.js";
import { checkAdmin } from "./utils/checkAdmin.js";
import EmailService from './services/emailService.js';



dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.resolve("uploads")));
app.post("/upload", checkAuth, checkAdmin,  uploadImage);

app.post("/auth/login", loginValidation, handleValidationErrors, login);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  register
);
app.get("/auth/me", checkAuth, getMe);
app.post("/auth/logout", logout);

app.get("/categories", getCategories);
app.post("/categories", checkAuth, createCategory);
app.patch("/categories/:id", checkAuth, updateCategory);
app.delete("/categories/:id", checkAuth, deleteCategory);

app.get("/trees", getAllTrees);
app.post("/trees",checkAuth, createTree);
app.patch("/trees/:id", checkAuth, updateTree);
app.delete("/trees/:id", checkAuth, deleteTree);


const emailService = new EmailService();

emailService.testConnection();

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server works");
});
