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
    const {email, code} = req.body;
    const user = await UserSchema.findOne({email});

    if (!user) {
      return res.status(400).json({ message: "User not found..." });
    }

     if (
    user.verificationToken !== code ||
    !user.verificationTokenExpires ||
    user.verificationTokenExpires < new Date()
  ) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }
  
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();
    res.json({ message: "Email successfully verified!" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed!" });
  }
};
