const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unity_serve_fallback_secret_key';

function createToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verifyJWT(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access. No authorization token found.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden access. Token is invalid or has expired.',
      });
    }

    req.user = decoded;
    next();
  });
}

module.exports = {
  createToken,
  verifyJWT,
};
