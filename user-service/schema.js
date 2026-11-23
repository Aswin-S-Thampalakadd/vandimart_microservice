const { varchar } = require("drizzle-orm/pg-core");
const { timestamp } = require("drizzle-orm/pg-core");
const { serial } = require("drizzle-orm/pg-core");
const { pgTable } = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull(),

  createdAt: timestamp("created_at", { length: 255 }).defaultNow(),
});

module.exports = { users };
