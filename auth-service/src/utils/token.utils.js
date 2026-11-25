const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
      issuer: "auth-service",
      algorithm: "HS256",
      audience: "microservices-api",
    },
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

const hashRefreshToken = (refreshToken) => {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};
