const { varchar } = require("drizzle-orm/pg-core");
const { timestamp } = require("drizzle-orm/pg-core");
const { serial } = require("drizzle-orm/pg-core");
const { pgTable } = require("drizzle-orm/pg-core");

const authUsers = pgTable("auth_users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

module.exports = { authUsers };
