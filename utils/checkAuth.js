// utils/checkAuth.js
import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";
import { t } from "../localisation.js";

export const checkAuth = (req, res, next) => {
  const token =
    req.cookies.auth_token ||
    (req.headers.authorization || "").replace(/Bearer\s?/, "");

  const userLang = user?.language || req.body.language || "ru";
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({message: t(userLang, "warnings.no_eccess")})
    }
  } else {
    return res.status(403).json({message: t(userLang, "warnings.no_eccess")})
  }
};

// Підтвердження email з автоматичним логіном
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email та код обов'язкові",
      });
    }

    // Знаходимо користувача за email та кодом
    const user = await UserModel.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
      isActive: true,
    });

    const userLang = user?.language || req.body.language || "ru";

    if (!user) {
      return res.status(400).json({
        message: t(userLang, "errors.invalid_or_expired_code"),
      });
    }

    // Якщо користувач вже підтверджений
    if (user.isVerified) {
      return res.status(400).json({
        message: t(userLang, "errors.already_verified"),
      });
    }

    // Підтверджуємо email та очищуємо код
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    // Генеруємо JWT токен для автоматичного логіну
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Прибираємо sensitive дані з відповіді
    const {
      passwordHash,
      resetCode,
      resetCodeExpires,
      verificationCode,
      verificationCodeExpires,
      ...userData
    } = user._doc;

    // Встановлюємо cookie та повертаємо дані користувача
    res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: false, // змініть на true для HTTPS в продакшені
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
        path: "/",
      })
      .status(200)
      .json({
        ...userData,
        message: t(userLang, "success.email_verified_and_logged_in"),
      });
  } catch (error) {
    console.log("Помилка при підтвердженні email:", error);
    res.status(500).json({
      message: t(req.body.language || "ru", "errors.server_error"),
    });
  }
};
