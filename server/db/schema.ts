import { randomUUID } from "crypto";
import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
// import { decimal } from "drizzle-orm/sqlite-core";

// Utility functions that create common column definitions.
const id = () =>
  text("id")
    .primaryKey()
    .$default(() => randomUUID());

const createdAt = () =>
  text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

const updatedAt = () =>
  text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull();

// products table
export const products = sqliteTable("products", {
  id: id(),
  sku: text("sku").unique().notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  // price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  imageURL: text("image_url"),
  createdAt: createdAt(),
});

// users table
export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// carts table
export const carts = sqliteTable("carts", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  total: integer("total").notNull().default(0),
});

//  cartProduct table- a junction table that sets a many-to-many relationship between carts and products.
export const cartProduct = sqliteTable("cart_product", {
  id: id(),
  cartId: text("cart_id").references(() => carts.id),
  productId: text("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  price: integer("price").notNull().default(0),
});

// orders table- stores order information, linking users and carts.
export const orders = sqliteTable("orders", {
  id: id(),
  userId: text("user_id").references(() => users.id),
  cartId: text("cart_id").references(() => carts.id),
  transactionId: text("transaction_id").notNull(),
  amount: integer("amount").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  cartProducts: many(cartProduct),
}));

export const usersRelations = relations(users, ({ many }) => ({
  carts: many(carts),
  orders: many(orders),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  cartProducts: many(cartProduct),
  order: one(orders, {
    fields: [carts.id],
    references: [orders.cartId],
  }),
}));

export const cartProductRelations = relations(cartProduct, ({ one }) => ({
  cart: one(carts, {
    fields: [cartProduct.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartProduct.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  cart: one(carts, {
    fields: [orders.cartId],
    references: [carts.id],
  }),
}));

// Type inferences
export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;
export type SelectCart = typeof carts.$inferSelect;
export type InsertCartProduct = typeof cartProduct.$inferInsert;
export type SelectCartProduct = typeof cartProduct.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;
