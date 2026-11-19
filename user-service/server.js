const express = require("express");
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 5001;

const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL || "http://localhost:5002";

const users = [
  {
    id: 1,
    name: "Aswin",
    email: "aswin@example.com",
  },
  {
    id: 2,
    name: "John",
    email: "john@example.com",
  },
];

app.get("/health", (req, res) => {
  res.json({
    service: "user-service",
    status: "running",
  });
});

app.get("/", (req, res) => {
  res.json([
    { id: 1, name: "Aswin" },
    { id: 2, name: "John" },
  ]);
});

app.get("/:id", (req, res) => {
  const userId = parseInt(req.params.id);

  const user = users.find((user) => user.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.get("/:id/cars", async (req, res) => {
  const userId = parseInt(req.params.id);
  const cars = await axios.get(`${CAR_SERVICE_URL}/cars`);

  const userCars = cars.data.filter((car) => car.sellerId === userId);

  if (userCars.length === 0) {
    return res.status(404).json({ message: "No cars found for this user" });
  }

  if (!cars) {
    return res.status(503).json({ message: "Car service is down" });
  }
  res.json(userCars);
});

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
