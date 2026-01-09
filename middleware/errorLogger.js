import logger from '../config/logger.js';

// Middleware для логування помилок
export const errorLogger = (err, req, res, next) => {
  // Логуємо помилку з деталями
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.userId || 'Гість',
    timestamp: new Date().toISOString()
  });

  next(err);
};

// Middleware для відповіді з помилкою клієнту
export const errorResponder = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Внутрішня помилка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};