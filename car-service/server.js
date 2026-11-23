require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { eq } = require("drizzle-orm");

const { db, pool } = require("./db");
const { cars } = require("./schema");

const app = express();
const port = process.env.PORT || 5002;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "car-service",
    status: "running",
  });
});

// Get all cars
app.get("/cars", async (req, res) => {
  try {
    const result = await db.select().from(cars);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch cars",
    });
  }
});

// Create a car
app.post("/cars", async (req, res) => {
  try {
    const { brand, model, price, sellerId } = req.body;

    if (
      !brand ||
      !model ||
      !Number.isInteger(price) ||
      price <= 0 ||
      !Number.isInteger(sellerId) ||
      sellerId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid car details",
      });
    }

    // Verify seller through User Service
    const sellerResponse = await axios.get(
      `${process.env.USER_SERVICE_URL}/users/${sellerId}`,
      { timeout: 3000 },
    );

    const [car] = await db
      .insert(cars)
      .values({
        brand,
        model,
        price,
        sellerId,
      })
      .returning();

    res.status(201).json({
      ...car,
      seller: sellerResponse.data,
    });
  } catch (error) {
    console.error(error.message);

    if (error.response?.status === 404) {
      return res.status(400).json({
        message: "Seller does not exist",
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "User Service unavailable",
      });
    }

    res.status(500).json({
      message: "Failed to create car",
    });
  }
});

// Get car with seller details
app.get("/cars/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid car ID",
      });
    }

    const [car] = await db.select().from(cars).where(eq(cars.id, id));

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    const sellerResponse = await axios.get(
      `${process.env.USER_SERVICE_URL}/users/${car.sellerId}`,
      { timeout: 3000 },
    );

    res.json({
      ...car,
      seller: sellerResponse.data,
    });
  } catch (error) {
    console.error(error.message);

    if (error.response?.status === 404) {
      return res.status(502).json({
        message: "Seller information unavailable",
      });
    }

    if (error.code === "ECONNABORTED" || error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "User Service unavailable",
      });
    }

    res.status(500).json({
      message: "Failed to fetch car",
    });
  }
});

const server = app.listen(port, () => {
  console.log(`Car Service running on port ${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
