require("dotenv").config();

const express = require("express");
const { eq } = require("drizzle-orm");
const { db, pool } = require("./db");
const { users } = require("./schema");

const app = express();

const port = process.env.PORT || 5001;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    service: "user-service",
    status: "running",
  });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await db.select().from(users);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch user",
    });
  }
});

// Create user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const [user] = await db.insert(users).values({ name, email }).returning();

    res.status(201).json(user);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create user",
    });
  }
});

const server = app.listen(port, () => {
  console.log(`User Service running on port ${port}`);
});

async function shutdown() {
  server.close();
  await pool.end();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
