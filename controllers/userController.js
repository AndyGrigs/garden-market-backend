import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import EmailService from "../services/emailService.js";
import { t } from "../localisation.js";
import { getUserLanguage } from '../utils/langDetector.js';
import { createNotification } from "./notificationController.js"; 
import { notifyAllAdmins } from '../config/adminConfig.js';


const emailService = new EmailService();

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const termsAccepted = req.body.termsAccepted;

    let userLang = getUserLanguage(req);
  

    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        message: t(userLang, "errors.user_exists"),
      });
    }

    const code = emailService.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Перевірка чи прийняті умови
    if (!termsAccepted) {
      return res.status(400).json({ 
        // message: 'Ви повинні прийняти умови використання' 
        message: t(userLang, "errors.accept_conditions") 
      });
}

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
      termsAccepted: true,
      termsAcceptedAt: new Date()
    });
    const user = await doc.save();

    if (req.body.role === 'seller') {
      try {
       
        await createNotification({
          type: 'new_seller_registration',
          title: 'Новая регистрация продавца',
          message: `Пользователь ${req.body.fullName} зарегистрировался"}"`,
          data: {
            userId: user._id,
            sellerInfo: {
              nurseryName: req.body.sellerInfo?.nurseryName,
              email: req.body.email,
              fullName: req.body.fullName,
            }
          }
        });

        // ⬇️ ВІДПРАВЛЯЄМО EMAIL ВСІМ АДМІНАМ
        const emailResults = await notifyAllAdmins(
          emailService,
          'new_seller_registration',
          {
            fullName: req.body.fullName,
            email: req.body.email,
            sellerInfo: req.body.sellerInfo,
            registrationTime: new Date().toLocaleString('uk-UA')
          }
        );

      } catch (notificationError) {
        console.error("Помилка сповіщень:", notificationError);
      }
          }

    await emailService.sendVerificationCodeEmail(
      user.email,
      user.fullName,
      code,
      user.language
    );

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role
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
    let userLang = getUserLanguage(req);
    
    const user = await UserModel.findOne({ 
      email: req.body.email, 
      isActive: true 
    });

    if (!user) {
      return res.status(404).json({ 
        message: t(userLang, "errors.user_not_found") 
      });
    }

    userLang = user.language || 'ru';

    const isValidPass = await bcrypt.compare(req.body.password, user.passwordHash);

    if (!isValidPass) {
      return res.status(400).json({ 
        message: t(userLang, "errors.wrong_login") 
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({ 
        message: t(userLang, "errors.email_not_verified") 
      });
    }

    if (!["buyer", "seller", "admin"].includes(user.role)) {
      return res.status(401).json({ 
        message: t(userLang, "errors.invalid_role") 
      });
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const { passwordHash, ...userData } = user._doc;

    res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: false, // für localhost
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
    const userLang = req.body.language || "ru";
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

    let userLang = getUserLanguage(req);
    

    if (!user) {
      return res.status(404).json({ message: t(userLang, "errors.user_not_found") });
    }
    userLang = user.language || 'ru';
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
    let userLang = user.language || 'ru';
    console.log(error);
    res.status(500).json({ message: t(userLang, "errors.server_error") });
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

export const getPendingSellers = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);

    const pendingSellers = await UserModel.find({
      role: 'seller',
      'sellerInfo.isApproved': false,
      isActive: true
    })
      .select('-passwordHash -resetCode -resetCodeExpires -verificationCode -verificationCodeExpires')
      .sort({ 'sellerInfo.registrationDate': -1 });

    res.json({
      sellers: pendingSellers,
      count: pendingSellers.length,
      message: t(userLang, "success.sellers.fetched", {
        defaultValue: "Продавцы успешно получены"
      })
    });
  } catch (error) {
    console.log(error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.server_error")
    });
  }
};

// ⬇️ ДОДАЙ ЦЮ ФУНКЦІЮ ПЕРЕД ОСТАННІМ EXPORT
export const getSavedAddress = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);
    const userId = req.userId; // З middleware checkAuth

    const user = await UserModel.findById(userId).select('buyerInfo.savedAddress');

    if (!user) {
      return res.status(404).json({ 
        message: t(userLang, "errors.user_not_found") 
      });
    }

    res.json({
      savedAddress: user.buyerInfo?.savedAddress || null
    });
  } catch (error) {
    console.error("Error fetching saved address:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.server_error")
    });
  }
};
