/// <reference path="./express.d.ts" />
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db/db";
import { products, carts, users, cartProduct, orders } from "./db/schema";
import { eq, and, inArray } from "drizzle-orm/expressions";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
interface CartUpdateRequest {
  add?: string[];
  remove?: string[];
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user as Express.Request["user"];
    next();
  });
};
app.get(
  "/v1/products",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const allProducts = await db.select().from(products);

      // TODO: Send userId to Ads team service
      // Example: await adsService.logUserProducts(userId, allProducts);

      return res.json(allProducts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

// Get shopping cart
// This query gives you the cart with all its products for a specific user in one go, utilizing the relationships defined in schema.ts.
// Extracts userId from query parameters. It checks if userId is provided, returning a 400 error if not.
// It queries the database with Drizzle ORM.
// - Starts from the carts table, filters for specific user's cart.
// - Left joins with cartProduct to get all prodcuts in the cart.
// - Left joins with products to get the details of each product.
app.get("/v1/cart", authenticateToken, async (req: Request, res: Response) => {
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
});

// Edit user's cart (add and remove)
// It extracts the userId from the query params and extracts add/remove from the request body.
// It finds or creates a cart for the user.
// If there are items to add, it inserts new cartProduct entries.

app.patch(
  "/v1/cart",
  authenticateToken,
  async (req: Request<{}, {}, CartUpdateRequest>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }
    const userId = req.user.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { add, remove } = req.body;
    console.log("Request Body: ", req.body);

    try {
      console.log("Attempting to find or create cart of userId: ", userId);
      let [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId));

      console.log("Found cart: ", cart);

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

        // Fetch product IDs for the given SKUs
        const productIds = await db
          .select({ id: products.id, sku: products.sku })
          .from(products)
          .where(inArray(products.sku, add));

        console.log("Found product IDs:", productIds);

        // Create a map of SKU to ID for easy lookup
        const skuToIdMap = new Map(productIds.map((p) => [p.sku, p.id]));

        // Only insert products that exist
        const productsToAdd = add
          .filter((sku: string) => skuToIdMap.has(sku))
          .map((sku: string) => ({
            id: uuidv4(),
            cartId: cart.id,
            productId: skuToIdMap.get(sku)!,
          }));

        if (productsToAdd.length > 0) {
          await db.insert(cartProduct).values(productsToAdd);
          console.log("Products added to cart");
        } else {
          console.log("No valid products to add");
        }
      }

      if (remove && remove.length > 0) {
        console.log("Removing products from cart: ", remove);

        // Fetch product IDs for the given SKUs to remove
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
              inArray(cartProduct.productId, productIdsToRemove)
            )
          );
        console.log("Products removed from cart");
      }

      console.log("Fetching updated cart");
      const updatedCart = await db
        .select()
        .from(carts)
        .where(eq(carts.id, cart.id))
        .leftJoin(cartProduct, eq(carts.id, cartProduct.cartId))
        .leftJoin(products, eq(cartProduct.productId, products.id));

      console.log("Updated cart: ", updatedCart);

      return res.json(updatedCart);
    } catch (error) {
      console.log("Error Updating cart: ", error);
      if (error instanceof Error) {
        console.error("Error message: ", error.message);
        console.error("Error stack: ", error.stack);
      }
      res.status(500).json({ error: "Failed to update cart" });
    }
  }
);
// Submit an order
// app.post("/v1/order", authenticateToken, async (req: Request, res: Response) => {
//   const userId = req.query.userId as string;
//   const cartId = req.query.cartId as string;

//   if (!userId || !cartId) {
//     return res.status(400).json({ error: "userId and cartId are required" });
//   }

//   try {
//     // Get everything into the cart first
//     const cartItems = await db
//       .select({
//         cartProductId: cartProduct.id,
//         productId: products.id,
//         productPrice: products.price,
//       })
//       .from(cartProduct)
//       .where(eq(cartProduct.cartId, cartId))
//       .leftJoin(products, eq(cartProduct.productId, products.id));

//     // Calculate total amount, filtering out any null products
//     const totalAmount = cartItems.reduce((sum, item) => {
//       if (item.productId && item.productPrice) {
//         return sum + item.productPrice;
//       }
//       return sum;
//     }, 0);

//     // Submit the order
//     const [newOrder] = await db
//       .insert(orders)
//       .values({
//         id: uuidv4(),
//         userId,
//         cartId,
//         transactionId: uuidv4(), // Generate a new transaction ID
//         amount: totalAmount,
//       })
//       .returning();

//     // Clear the cart after submitting the order
//     await db.delete(cartProduct).where(eq(cartProduct.cartId, cartId));

//     return res.json(newOrder);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to submit order" });
//   }
// });
app.post(
  "/v1/order",
  authenticateToken,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.userId as string;
    const cartId = req.body.cartId as string;

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

      return res.json(newOrder);
    } catch (error) {
      console.error("Error submitting order:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ error: "Failed to submit order" });
    }
  }
);
/* ----------------------------- Authentication ----------------------------- */

app.post("/v1/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  console.log("name: ", name, "email: ", email, "password: ", password);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
      })
      .returning();

    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    console.log("Token: ", token);

    res.status(201).json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

// User login
app.post("/v1/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in" });
  }
});

/* ------ Catch all route handler for any requests to an unknown route ------ */
app.use((req: Request, res: Response) =>
  res.status(404).send("This is not the page you're looking for...")
);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: "Express error handler caught unknown middleware error",
    status: 500,
    message: { err: "An error occurred" },
  };
  if (err instanceof Error) {
    // If err is an instance of Error, override the default message
    const errorObj = {
      ...defaultErr,
      message: err.message,
    };
    console.log(errorObj.log);
    return res.status(errorObj.status).json({ err: errorObj.message });
  } else {
    // If err is not an Error, use the default error object
    console.log(defaultErr.log);
    return res.status(defaultErr.status).json({ err: defaultErr.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
