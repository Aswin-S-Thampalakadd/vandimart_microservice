require("dotenv").config();

const express = require("express");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "auth-service",
    status: "healthy",
  });
});

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
