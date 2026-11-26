const jwt = require("jsonwebtoken");

const authenticateService = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return req.status(401).json({
      message: "Service access token required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "auth-service",
      audience: "internal-services",
      algorithms: ["HS256"],
    });

    if (decoded.sub !== "car-service") {
      return res.status(403).json({ message: "Service is not authorized" });
    }

    req.service = {
      name: decoded.sub,
      scope: decoded.scope,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired service token",
    });
  }
};

module.exports = authenticateService;
