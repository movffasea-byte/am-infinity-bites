const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret";

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied! Please login first.' });
  }

  // Strip "Bearer " from token
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token!' });
  }
  console.log("Authorization header:", req.headers.authorization);
}

module.exports = verifyToken;