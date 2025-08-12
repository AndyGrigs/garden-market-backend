
export const checkSeller = (req, res, next) => {
  if (req.userRole !== 'seller') {
    return res.status(403).json({ 
      message: "Доступ тільки для продавців" 
    });
  }
  next();
};

export const checkSellerOrAdmin = (req, res, next) => {
  if (req.userRole !== 'seller' && req.userRole !== 'admin') {
    return res.status(403).json({ 
      message: "Доступ тільки для продавців та адмінів" 
    });
  }
  next();
};