function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      const user = req.user;
  
      if (!user) {
        if (req.originalUrl.startsWith('/cms')) {
          return res.render('404');  
        }
        return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
      }
  
      if (!allowedRoles.includes(user.role)) {
        if (req.originalUrl.startsWith('/cms')) {
            return res.render('404');  

        }
        return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
      }
  
      next();
    };
  }
  
  module.exports = authorizeRoles;
  