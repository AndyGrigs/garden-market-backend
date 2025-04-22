import express from "express";
import cors from "cors";

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
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.log('❌ MongoDB connection error:', err);
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

app.post("/auth/login", loginValidation, handleValidationErrors, login);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  register
);
app.get("/auth/me", checkAuth, getMe);
app.post("/auth/logout", logout);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Server works");
});
