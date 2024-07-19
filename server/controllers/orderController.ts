import { Request, Response } from "express";
import { db } from "../db/db";
import { carts, cartProduct, orders, products } from "../db/schema";
import { eq, and } from "drizzle-orm/expressions";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload & { userId: string };
}
export const submitOrder = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const userId = req.user.userId as string;

  //* THIS FINDS THE cart id
  let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));

  const cartId = cart.id;
  if (!cartId) {
    return res.status(400).json({ error: "cartId is required" });
  }

  try {
    console.log(`Submitting order for user ${userId} with cart ${cartId}`);

    // Verify the cart belongs to the user
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.id, cartId), eq(carts.userId, userId)));

    if (!userCart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    // Get everything in the cart
    const cartItems = await db
      .select({
        cartProductId: cartProduct.id,
        productId: products.id,
        productPrice: products.price,
      })
      .from(cartProduct)
      .where(eq(cartProduct.cartId, cartId))
      .leftJoin(products, eq(cartProduct.productId, products.id));

    console.log(`Found ${cartItems.length} items in the cart`);

    // Calculate total amount, filtering out any null products
    const totalAmount = cartItems.reduce((sum, item) => {
      if (item.productId && item.productPrice) {
        return sum + item.productPrice;
      }
      return sum;
    }, 0);

    console.log(`Total order amount: ${totalAmount}`);

    // Submit the order
    const [newOrder] = await db
      .insert(orders)
      .values({
        id: uuidv4(),
        userId,
        cartId,
        transactionId: uuidv4(), // Generate a new transaction ID
        amount: totalAmount,
      })
      .returning();

    console.log(`New order created with ID: ${newOrder.id}`);

    // Clear the cart after submitting the order
    await db.delete(cartProduct).where(eq(cartProduct.cartId, cartId));
    console.log(`Cleared cart ${cartId}`);
    console.log("New Order TransactionID: ", newOrder.transactionId);
    console.log("New Order Amount: ", newOrder.amount);

    return res.json(newOrder);
  } catch (error) {
    console.error("Error submitting order:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({ error: "Failed to submit order" });
  }
};
