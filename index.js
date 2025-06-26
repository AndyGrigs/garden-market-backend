import express from "express";
import cors from "cors";
import path from "path"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import mongoose from "mongoose";

import { registerValidation } from "./validations/auth.js";
import { loginValidation } from "./validations/login.js";

import { checkAuth, verifyEmail } from "./utils/checkAuth.js";
import {
  register,
  login,
  getMe,
  logout,
  sendResetCode,
  resetPassword,
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
import { checkAdmin } from "./utils/checkAdmin.js";
import EmailService from './services/emailService.js';
import { uploadImage } from "./controllers/uploadController.js";
import { deleteImage } from './controllers/uploadController.js';
import { authenticate, authenticateOptional } from './utils/authMiddleware.js';
import { getReviews, createReview, getUserReviews } from './controllers/reviewController.js';



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
    origin: "http://localhost:5173"  ,
    // origin: "https://sb1d2sqww-i3ef--5173--10996a95.local-credentialless.webcontainer.io",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.resolve("uploads")));


app.post("/auth/login", loginValidation, handleValidationErrors, login);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  register
);
app.post("/auth/verify-email", verifyEmail)
app.get("/auth/me", checkAuth, getMe);
app.post("/auth/logout", logout);
app.post('/auth/send-reset-code', sendResetCode);
app.post('/auth/reset-password', resetPassword);   


app.get("/categories", getCategories);
app.post("/categories", checkAuth, createCategory);
app.patch("/categories/:id", checkAuth, updateCategory);
app.delete("/categories/:id", checkAuth, deleteCategory);

app.get("/trees", getAllTrees);
app.post("/trees",checkAuth, createTree);
app.patch("/trees/:id", updateTree);
app.delete("/trees/:id", checkAuth, deleteTree);
app.post("/upload", uploadImage)
app.delete("/delete-image/:filename", deleteImage)

// Ендпоінти рев’ю без окремого роутера
app.get('/api/reviews', getReviews);
app.post('/api/reviews', checkAuth, createReview);
app.get('/api/reviews/user/:userId', getUserReviews);

const emailService = new EmailService();

emailService.testConnection();

app.use("/uploads", express.static(path.resolve("uploads")));

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server works");
});
