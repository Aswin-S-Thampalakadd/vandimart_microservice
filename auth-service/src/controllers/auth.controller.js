const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { eq, isNull, gt, and } = require("drizzle-orm");

const { db } = require("../config/db");
const { authUsers, refreshTokens } = require("../schemas/auth.schema");
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require("../utils/token.utils");

const register = async (req, res) => {
  try {
    const { userId, email, password } = req.body;

    if (!userId || !email || !password) {
      return res.status(400).json({
        message: "userId, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, normalizedEmail));

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(authUsers)
      .values({
        userId,
        email: normalizedEmail,
        passwordHash,
      })
      .returning({
        id: authUsers.id,
        userId: authUsers.userId,
        email: authUsers.email,
        role: authUsers.role,
      });

    return res.status(201).json({
      message: "Registration successful",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.email, normalizedEmail));

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // const accessToken = jwt.sign(
    //   {
    //     userId: user.userId,
    //     role: user.role,
    //   },
    //   process.env.JWT_SECRET,
    //   {
    //     expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    //     issuer: "auth-service",
    //   },
    // );

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();

    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(refreshTokens).values({
      userId: user.userId,
      tokenHash,
      expiresAt,
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token is required",
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    const [user] = await db
      .select()
      .from(authUsers)
      .where(eq(authUsers.userId, storedToken.userId));

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const newRefreshToken = generateRefreshToken();

    const newTokenHash = hashRefreshToken(newRefreshToken);

    const newExpiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.transaction(async (tx) => {
      await tx
        .update(refreshTokens)
        .set({
          revokedAt: new Date(),
        })
        .where(eq(refreshTokens.id, storedToken.id));

      await tx.insert(refreshTokens).values({
        userId: user.userId,
        tokenHash: newTokenHash,
        expiresAt: newExpiredAt,
      });
    });

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Implementation for refreshing access token
  } catch (error) {
    console.log("Refresh token error : ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
        ),
      );

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error : ", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { register, login, refreshAccessToken, logout };
