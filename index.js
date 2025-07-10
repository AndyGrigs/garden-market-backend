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
import { uploadImage, upload } from "./controllers/uploadController.js";
import { deleteImage } from './controllers/uploadController.js';
import { authenticate } from './utils/authMiddleware.js';
import { getReviews, createReview, getUserReviews, updateReview, deleteReview } from './controllers/reviewController.js';
import rateLimit from 'express-rate-limit';
import { treeValidation } from './validations/tree.js';
import { errorHandler } from './utils/errorHandler.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});





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
app.use(errorHandler);
app.use(
  cors({
    origin: "http://localhost:5173"  ,
    // origin: "https://sb1d2sqww-i3ef--5173--10996a95.local-credentialless.webcontainer.io",
    credentials: true,
  })
);

app.use("/uploads", express.static(path.resolve("uploads")));

app.use('/auth/login', authLimiter);
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
app.post("/categories", checkAuth, upload.single("image"), createCategory);
app.patch("/categories/:id", checkAuth, upload.single("image"), updateCategory);
app.delete("/categories/:id", checkAuth, deleteCategory);

app.post("/upload", uploadImage);
app.delete("/delete-image/:filename", deleteImage);
app.get("/image-info/:filename", getImageInfo); 
app.post("/cleanup-files", checkAuth, checkAdmin, cleanupOldFiles); 

app.get("/trees", getAllTrees);
app.post("/trees",checkAuth, createTree, handleValidationErrors, treeValidation);
app.patch("/trees/:id", checkAuth, checkAdmin, treeValidation, handleValidationErrors,  updateTree);
app.delete("/trees/:id", checkAuth, checkAdmin, deleteTree);
app.delete("/delete-image/:filename", deleteImage)


app.get('/api/reviews', getReviews);
app.post('/api/reviews', authenticate, createReview);
app.get('/api/reviews/user/:userId', authenticate,  getUserReviews);
app.patch('/api/reviews/:id', authenticate, updateReview);
app.delete('/api/reviews/id', authenticate, deleteReview);

const emailService = new EmailService();

emailService.testConnection();

app.use("/uploads", express.static(path.resolve("uploads")));

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server works");
});
