 
// import jwt from 'jsonwebtoken';

// export const checkAuth = (req, res, next) => {
//   try {
//     const token = req.cookies.auth_token;

//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET); 

//     req.userId = decoded._id;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };

import jwt from 'jsonwebtoken';
import UserSchema from '../models/user.js'; // Import UserSchema

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserSchema.findById(decoded._id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: 'Користувача не знайдено' });
    }

    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

