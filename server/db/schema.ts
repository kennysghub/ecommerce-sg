import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$default(() => randomUUID());

const createdAt = () =>
  text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

export const products = sqliteTable("products", {
  id: id(),
  sku: text("sku").unique().notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  imageURL: text("image_url"),
  createdAt: createdAt(),
});

// If you need relations in the future, you can add them like this:
// export const productRelations = relations(products, ({ many }) => ({
//   // Add relations here
// }))

export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;
