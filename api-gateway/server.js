const express = require("express");

const dotenv = require("dotenv");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authenticate = require("./middleware/auth.middleware");
const authorize = require("./middleware/authorize.middleware");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  console.log({
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  next();
});

app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "running",
  });
});

app.use(
  "/api/users",
  authenticate,

  createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/users": "/users",
    },
  }),
);

app.use(
  "/api/cars",
  createProxyMiddleware({
    target: process.env.CAR_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/cars": "/cars",
    },
  }),
);

app.use(
  "/api/admin",
  authenticate,
  authorize("ADMIN"),
  createProxyMiddleware({
    target: process.env.ADMIN_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api/admin": "/admin",
    },
  }),
);

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
