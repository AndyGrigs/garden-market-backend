import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import EmailService from "../services/emailService.js";
import { t } from "../localisation.js";
import { getUserLanguage } from '../utils/langDetector.js';

const emailService = new EmailService();

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userLang = getUserLanguage(req);

    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        message: t(userLang, "errors.user_exists"),
      });
    }

    // Generate verification code and expiry (10 min)
    const code = emailService.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      language: userLang,
      role: req.body.role || "buyer",
      sellerInfo: req.body.sellerInfo || {},
      buyerInfo: req.body.buyerInfo || {},
      isVerified: false,
      verificationCode: code,
      verificationCodeExpires,
      isActive: true,
    });
    const user = await doc.save();

    // Send email with code
    await emailService.sendVerificationCodeEmail(
      user.email,
      user.fullName,
      code,
      user.language
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
      message: t(userLang, "success.register"),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: t(req.body.language || "ru", "errors.server_error"),
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    const userLang = getUserLanguage(req);

    if (!user) {
      return res
        .status(401)
        .json({ message: t(userLang, "errors.invalid_credentials") });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: t(userLang, "errors.invalid_credentials") });
    }

    if (!["buyer", "seller", "admin"].includes(user.role)) {
      return res
        .status(401)
        .json({ message: t(userLang, "errors.invalid_role") });
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
      .json({
        ...userData,
        message: t(userLang, "success.login"),
      });
  } catch (error) {
    const userLang = req.body.language || "en";
    console.log(error);
    res.status(500).json({ message: t(userLang, "errors.login_failed") });
  }
};

export const getMe = async (req, res) => {
    const userLang = getUserLanguage(req);

  try {
    const user = await UserModel.findById(req.userId).select("-passwordHash");

    if (!user) {
       return res.status(404).json({ message: t(userLang, 'errors.user_not_found') });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: t(userLang, 'errors.server_error') });
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

export const sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email, isActive: true });

    const userLang = getUserLanguage(req);
    

    if (!user) {
      return res.status(404).json({ message: t(userLang, "errors.user_not_found") });
    }

    // Генеруємо 3-значний код
    const code = emailService.generateVerificationCode();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetCode = code;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Відправляємо e-mail з кодом
    await emailService.sendResetCodeEmail(
      user.email,
      user.fullName,
      code,
      user.language
    );

    res.json({ message: t(userLang, "success.reset_code_sent") });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: t("en", "errors.server_error") });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { code, newPassword, email } = req.body;
    const user = await UserModel.findOne({
      email,
      resetCode: code,
      resetCodeExpires: { $gt: new Date() },
      isActive: true,
    });

    const userLang = getUserLanguage(req);
   

    if (!user) {
      return res
        .status(400)
        .json({ message: t(userLang, "errors.invalid_or_expired_code") });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({ message: t(userLang, "success.password_changed") });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: t(userLang, "errors.server_error") });
  }
};

// Додайте цю функцію до userController.js

export const resendVerificationCode = async (req, res) => {
    const userLang = getUserLanguage(req);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: t(userLang, 'error.email_charged') 
      });
    }

    const user = await UserModel.findOne({ 
      email, 
      isActive: true 
    });

    const userLang = getUserLanguage(req);
    

    if (!user) {
      return res.status(404).json({ 
        message: t(userLang, "errors.user_not_found")
      });
    }

    // Якщо користувач вже підтверджений
    if (user.isVerified) {
      return res.status(400).json({ 
        message: t(userLang, "errors.already_verified")
      });
    }

    // Перевіряємо, чи не надто часто запитує код (не частіше ніж раз на хвилину)
    if (user.verificationCodeExpires && 
        user.verificationCodeExpires > new Date(Date.now() + 9 * 60 * 1000)) {
      return res.status(429).json({ 
        message: "Спробуйте пізніше. Код вже відправлено."
      });
    }

    // Генеруємо новий код
    const code = emailService.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Оновлюємо користувача з новим кодом
    user.verificationCode = code;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Відправляємо email з новим кодом
    await emailService.sendVerificationCodeEmail(
      user.email,
      user.fullName,
      code,
      user.language
    );

    res.json({ 
      message: t(userLang, "success.verification_code_resent")
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: t(userLang, "errors.server_error")
    });
  }
};
