const {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
} = require("drizzle-orm/pg-core");

const cars = pgTable("cars", {
  id: serial("id").primaryKey(),

  brand: varchar("brand", {
    length: 100,
  }).notNull(),

  model: varchar("model", {
    length: 100,
  }).notNull(),

  price: integer("price").notNull(),

  sellerId: integer("seller_id").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { cars };
