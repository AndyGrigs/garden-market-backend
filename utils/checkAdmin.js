export const checkAdmin = (req, res, next) => {
  // Використовуємо req.userRole замість req.user.role
  if (!req.userRole || req.userRole !== "admin") {
    return res.status(403).json({ 
      message: "Доступ заборонено. Лише для адміністратора." 
    });
  }
  next();
};