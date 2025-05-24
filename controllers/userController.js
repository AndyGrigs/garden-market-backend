import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../models/user.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      role: req.body.role || "buyer",
      sellerInfo: req.body.sellerInfo || {},
      buyerInfo: req.body.buyerInfo || {},
    });
    const user = await doc.save();



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

    // Check if the user has a valid role
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

// export const getMe = async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.userId);

//     if (!user) {
//       return res.status(404).json({
//         message: "User is not found!",
//       });
//     }

//     const { passwordHash, ...userData } = user._doc;

//     if (user.role === "seller") {
//       userData.sellerInfo = user.sellerInfo;
//     } else if (user.role === "buyer") {
//       userData.buyerInfo = user.buyerInfo;
//     }

//     res.json(userData);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "some error",
//     });
//   }
// };

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    sameSite: 'Strict',
    path: '/',
  });
  res.status(200).json({ message: 'Logout successful' });
};
