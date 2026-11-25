require("dotenv").config();

module.exports = {
  schema: "./src/schemas/auth.schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
