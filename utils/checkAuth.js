

// import jwt from 'jsonwebtoken'

// export default (req, res, next) => {
//   const token = (req.headers.authorization || '').replace(/Bearer\s?/, '')
//   if (token) {
//     try {
//       const decoded = jwt.verify(token, '')
//       req.userId = decoded._id
//     } catch (error) {
//       return res.status(403).json({
//         message: 'No access!'
//       })
//     }
//   } else {
//     return res.status(403).json({
//       message: 'No access!'
//     })
//   }
//   next()
// }
import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); 

    req.userId = decoded._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};



