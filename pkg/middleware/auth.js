const jwt = require("jsonwebtoken");
const { ResponseError } = require("./../response");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia123";

const AuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return ResponseError(res, 401, "Token dibutuhkan");

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return ResponseError(res, 401, "Token tidak valid");
  }
};

module.exports = AuthMiddleware;
