import jwt from 'jsonwebtoken';
import User from './models/user.js';

/**
 * Строгий middleware: перевіряє наявність і валідність JWT,
 * якщо токен відсутній або невірний — повертає 401.
 */
export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    const token = auth.split(' ')[1];
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}


/**
 * Опціональний middleware: якщо є валідний JWT — додає req.user,
 * якщо ні — просто пропускає далі без помилки.
 */
export async function authenticateOptional(req, res, next) {
  const auth = req.headers.authorization;
  if (auth) {
    try {
      const token = auth.split(' ')[1];
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(id);
    } catch {
      // ігноруємо невірний токен
    }
  }
  next();
}
