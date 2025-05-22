const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    if (req.originalUrl.startsWith('/cms')) {
      return res.status(404).render('404');
    }
    return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    if (req.originalUrl.startsWith('/cms')) {
      return res.status(404).render('404');
    }
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

module.exports = authenticateToken;
