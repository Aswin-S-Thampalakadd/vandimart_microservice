const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const token = (req, res) => {
  try {
    const { grant_type, client_id, client_secret } = req.body;
    if (grant_type !== "client_credentials") {
      return res.status(400).json({
        message: "Unsupported grant type",
      });
    }

    const expectedId = process.env.SERVICE_CLIENT_ID;
    const expectedSecret = process.env.SERVICE_CLIENT_SECRET;

    const safeEqual = (a, b) => {
      if (typeof a !== "string" || typeof b !== "string") {
        return false;
      }

      const aBuffer = Buffer.from(a);
      const bBuffer = Buffer.from(b);

      return (
        aBuffer.length === bBuffer.length &&
        crypto.timingSafeEqual(aBuffer, bBuffer)
      );
    };

    if (
      !safeEqual(client_id, expectedId) ||
      !safeEqual(client_secret, expectedSecret)
    ) {
      return res.status(401).json({
        message: "Invalid client credentials",
      });
    }

    const accessToken = jwt.sign(
      {
        scope: "users:read",
      },
      process.env.JWT_SECRET,
      {
        subject: client_id,
        issuer: "auth-service",
        audience: "internal-services",
        expiresIn: process.env.SERVICE_TOKEN_EXPIRES_IN || "5m",
        algorithm: "HS256",
      },
    );

    return res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 300,
    });
  } catch (error) {
    console.log("Service token error : ", error);
    return res.status(500).json({
      message: "Unable to generate service token",
    });
  }
};

module.exports = { token };
