import jwt from "jsonwebtoken";
import UserSchema from "../models/user.js"; 

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserSchema.findById(decoded._id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Користувача не знайдено" });
    }

    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        message: "Email та код обов'язкові" 
      });
    }

    // Знаходимо користувача за email та кодом
    const user = await UserModel.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() }, // Код ще не прострочений
      isActive: true
    });

    const userLang = user?.language || req.body.language || "ru";

    if (!user) {
      return res.status(400).json({ 
        message: t(userLang, "errors.invalid_or_expired_code")
      });
    }

    // Якщо користувач вже підтверджений
    if (user.isVerified) {
      return res.status(400).json({ 
        message: t(userLang, "errors.already_verified")
      });
    }

    // Підтверджуємо email та очищуємо код
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    res.json({ 
      message: t(userLang, "success.email_verified"),
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        isVerified: user.isVerified,
        role: user.role
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: t(req.body.language || "ru", "errors.server_error")
    });
  }
};
