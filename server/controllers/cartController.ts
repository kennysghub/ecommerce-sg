import { Request, Response } from "express";
import { db } from "../db/db";
import { carts, cartProduct, products } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm/expressions";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload & { userId: string };
}
interface CartUpdateRequest {
  add?: string[];
  remove?: string[];
  update?: { sku: string; quantity: number }[];
}

export const getCart = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  console.log("userId: ", userId);
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .leftJoin(cartProduct, eq(carts.id, cartProduct.cartId))
      .leftJoin(products, eq(cartProduct.productId, products.id));

    return res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const updateCart = async (
  // req: Request<{}, {}, CartUpdateRequest>,
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const userId = req.user.userId as string;

  const { add, remove, update } = req.body;
  console.log("Request Body: ", req.body);

  try {
    console.log("Attempting to find or create cart of userId: ", userId);
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));

    if (!cart) {
      console.log("Cart not found, creating a new cart");
      [cart] = await db
        .insert(carts)
        .values({ userId, id: uuidv4() })
        .returning();
      console.log("New cart created: ", cart);
    }

    if (add && add.length > 0) {
      console.log("Adding products to cart: ", add);

      // Fetch all products to be added at once
      const productsToAdd = await db
        .select()
        .from(products)
        .where(inArray(products.sku, add));

      for (const product of productsToAdd) {
        const [existingCartProduct] = await db
          .select()
          .from(cartProduct)
          .where(
            and(
              eq(cartProduct.cartId, cart.id),
              eq(cartProduct.productId, product.id),
            ),
          );

        if (existingCartProduct) {
          // If the product is already in the cart, increment the quantity
          console.log("Existing Product... ", existingCartProduct);
          await db
            .update(cartProduct)
            .set({ quantity: existingCartProduct.quantity + 1 })
            .where(eq(cartProduct.id, existingCartProduct.id));
        } else {
          // If the product is not in the cart, add it
          await db.insert(cartProduct).values({
            id: uuidv4(),
            cartId: cart.id,
            productId: product.id,
            price: product.price,
            quantity: 1,
          });
        }
      }
      console.log("Products added to cart");
    }

    if (remove && remove.length > 0) {
      console.log("Removing products from cart: ", remove);

      const productsToRemove = await db
        .select({ id: products.id })
        .from(products)
        .where(inArray(products.sku, remove));

      const productIdsToRemove = productsToRemove.map((p) => p.id);

      await db
        .delete(cartProduct)
        .where(
          and(
            eq(cartProduct.cartId, cart.id),
            inArray(cartProduct.productId, productIdsToRemove),
          ),
        );
      console.log("Products removed from cart");
    }

    if (update && update.length > 0) {
      console.log("Updating product quantities in cart: ", update);

      for (const { sku, quantity } of update) {
        const [product] = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.sku, sku));

        if (product) {
          await db
            .update(cartProduct)
            .set({ quantity })
            .where(
              and(
                eq(cartProduct.cartId, cart.id),
                eq(cartProduct.productId, product.id),
              ),
            );
        }
      }

      console.log("Product quantities updated");
    }

    console.log("Fetching updated cart");
    const updatedCart = await db
      .select({
        cartId: carts.id,
        userId: carts.userId,
        productId: products.id,
        productSku: products.sku,
        productName: products.name,
        productPrice: products.price,
        productImageURL: products.imageURL,
        quantity: cartProduct.quantity,
      })
      .from(carts)
      .where(eq(carts.id, cart.id))
      .leftJoin(cartProduct, eq(carts.id, cartProduct.cartId))
      .leftJoin(products, eq(cartProduct.productId, products.id));

    // Transform the result to match the expected format
    const formattedCart = {
      cartId: cart.id,
      userId: cart.userId,
      items: updatedCart.map((item) => ({
        sku: item.productSku,
        name: item.productName,
        price: item.productPrice,
        imageURL: item.productImageURL,
        qty: item.quantity,
      })),
    };

    return res.json(formattedCart);
  } catch (error) {
    console.error("Error Updating cart: ", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
};

export const replaceCart = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  const userId = req.user.userId as string;
  const { cart } = req.body;

  try {
    // First, find or create the user's cart
    let [userCart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId));

    if (!userCart) {
      [userCart] = await db
        .insert(carts)
        .values({ userId, id: uuidv4() })
        .returning();
    }

    // Clear the existing cart products
    await db.delete(cartProduct).where(eq(cartProduct.cartId, userCart.id));

    // Add all items from the updated cart
    for (const item of cart) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.sku, item.sku));

      if (product) {
        await db.insert(cartProduct).values({
          id: uuidv4(),
          cartId: userCart.id,
          productId: product.id,
          quantity: item.qty,
          price: product.price,
        });
      }
    }

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
};
