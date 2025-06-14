import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import EmailService from "../services/emailService.js";
import crypto from "crypto";

const emailService = new EmailService();

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Generate verification token and expiry (24h)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      role: req.body.role || "buyer",
      sellerInfo: req.body.sellerInfo || {},
      buyerInfo: req.body.buyerInfo || {},
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      isActive: true,
    });
    const user = await doc.save();

    // Send welcome email
    await emailService.sendVerificationEmail(
      user.email,
      user.fullName,
      verificationToken
    );

    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({
      ...userData,
      token,
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ragistration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!["buyer", "seller", "admin"].includes(user.role)) {
      return res.status(401).json({ message: "Invalid user role" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const { passwordHash, ...userData } = user._doc;

    res
      .cookie("auth_token", token, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === "production", HTTPS only у продакшені
        secure: false,
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      })
      .status(200)
      .json({ ...userData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: "Strict",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email, isActive: true });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email is not exist" });
    }

    
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpires = resetTokenExpires;
    await user.save();

    emailService.sendPasswordResetEmail(user.email, user.fullName, resetToken);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error reset password" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await UserModel.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Недійсний або прострочений токен" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: "Пароль успішно змінено" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Помилка при зміні пароля" });
  }
};
