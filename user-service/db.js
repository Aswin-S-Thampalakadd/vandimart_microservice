const { Pool } = require("pg");
const schema = require("./schema");

const { drizzle } = require("drizzle-orm/node-postgres");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

module.exports = { db, pool };
