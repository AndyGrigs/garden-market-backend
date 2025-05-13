export const checkAdmin = (req, res, next) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Доступ заборонено. Лише для адміністратора." });
  }

  next();
};
