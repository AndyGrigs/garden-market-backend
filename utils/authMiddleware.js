import jwt from 'jsonwebtoken';
import User from '../models/user.js'; // Use consistent naming

/**
 * Строгий middleware: перевіряє наявність і валідність JWT,
 * якщо токен відсутній або невірний — повертає 401.
 */
export async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    const token = auth.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET || '');
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT auth error:', err.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Опціональний middleware: якщо є валідний JWT — додає req.user,
 * якщо ні — просто пропускає далі без помилки.
 */
export async function authenticateOptional(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.split(' ')[1];
      if (token) {
        const { id } = jwt.verify(token, process.env.JWT_SECRET || '');
        req.user = await User.findById(id);
      }
    } catch (err) {
      // ігноруємо невірний токен, але можна залогувати для дебагу
      console.warn('Optional JWT auth failed:', err.message);
    }
  }
  next();
}