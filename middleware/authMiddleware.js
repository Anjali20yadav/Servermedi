const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // token uthao

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // token check karo
    req.user = decoded; // user info save karo
    next(); // aage badho
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
