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
  update?: { sku: string; quantity: number }[];
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

// app.patch(
//   "/v1/cart",
//   authenticateToken,
//   async (req: Request<{}, {}, CartUpdateRequest>, res: Response) => {
//     if (!req.user) {
//       return res.status(401).json({ error: "User not found" });
//     }
//     const userId = req.user.userId as string;
//     if (!userId) {
//       return res.status(400).json({ error: "userId is required" });
//     }

//     const { add, remove, update } = req.body;
//     console.log("Request Body: ", req.body);

//     try {
//       console.log("Attempting to find or create cart of userId: ", userId);
//       let [cart] = await db
//         .select()
//         .from(carts)
//         .where(eq(carts.userId, userId));

//       console.log("Found cart: ", cart);

//       if (!cart) {
//         console.log("Cart not found, creating a new cart");
//         [cart] = await db
//           .insert(carts)
//           .values({ userId, id: uuidv4() })
//           .returning();
//         console.log("New cart created: ", cart);
//       }

//       if (add && add.length > 0) {
//         console.log("Adding products to cart: ", add);

//         // Fetch product IDs and prices for the given SKUs
//         const productIds = await db
//           .select({ id: products.id, sku: products.sku, price: products.price })
//           .from(products)
//           .where(inArray(products.sku, add));

//         console.log("Found product IDs:", productIds);

//         // Create a map of SKU to product details for easy lookup
//         const skuToProductMap = new Map(productIds.map((p) => [p.sku, p]));

//         // Only insert products that exist
//         const productsToAdd = add
//           .filter((sku: string) => skuToProductMap.has(sku))
//           .map((sku: string) => {
//             const product = skuToProductMap.get(sku)!;
//             return {
//               id: uuidv4(),
//               cartId: cart.id,
//               productId: product.id,
//               price: product.price,
//               quantity: 1, // Default quantity
//             };
//           });

//         if (productsToAdd.length > 0) {
//           await db.insert(cartProduct).values(productsToAdd);
//           console.log("Products added to cart");
//         } else {
//           console.log("No valid products to add");
//         }
//       }

//       if (remove && remove.length > 0) {
//         console.log("Removing products from cart: ", remove);

//         // Fetch product IDs for the given SKUs to remove
//         const productsToRemove = await db
//           .select({ id: products.id })
//           .from(products)
//           .where(inArray(products.sku, remove));

//         const productIdsToRemove = productsToRemove.map((p) => p.id);

//         await db
//           .delete(cartProduct)
//           .where(
//             and(
//               eq(cartProduct.cartId, cart.id),
//               inArray(cartProduct.productId, productIdsToRemove)
//             )
//           );
//         console.log("Products removed from cart");
//       }

//       if (update && update.length > 0) {
//         console.log("Updating product quantities in cart: ", update);

//         for (const { sku, quantity } of update) {
//           const [product] = await db
//             .select({ id: products.id })
//             .from(products)
//             .where(eq(products.sku, sku));

//           if (product) {
//             await db
//               .update(cartProduct)
//               .set({ quantity })
//               .where(
//                 and(
//                   eq(cartProduct.cartId, cart.id),
//                   eq(cartProduct.productId, product.id)
//                 )
//               );
//           }
//         }

//         console.log("Product quantities updated");
//       }

//       console.log("Fetching updated cart");
//       const updatedCart = await db
//         .select()
//         .from(carts)
//         .where(eq(carts.id, cart.id))
//         .leftJoin(cartProduct, eq(carts.id, cartProduct.cartId))
//         .leftJoin(products, eq(cartProduct.productId, products.id));

//       // console.log("Updated cart: ", updatedCart);

//       return res.json(updatedCart);
//     } catch (error) {
//       console.log("Error Updating cart: ", error);
//       if (error instanceof Error) {
//         console.error("Error message: ", error.message);
//         console.error("Error stack: ", error.stack);
//       }
//       res.status(500).json({ error: "Failed to update cart" });
//     }
//   }
// );

// app.patch(
//   "/v1/cart",
//   authenticateToken,
//   async (req: Request<{}, {}, CartUpdateRequest>, res: Response) => {
//     if (!req.user) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     const userId = req.user.userId as string;

//     const { add, remove, update } = req.body;
//     console.log("Request Body: ", req.body);

//     try {
//       console.log("Attempting to find or create cart of userId: ", userId);
//       let [cart] = await db
//         .select()
//         .from(carts)
//         .where(eq(carts.userId, userId));

//       if (!cart) {
//         console.log("Cart not found, creating a new cart");
//         [cart] = await db
//           .insert(carts)
//           .values({ userId, id: uuidv4() })
//           .returning();
//         console.log("New cart created: ", cart);
//       }

//       if (add && add.length > 0) {
//         console.log("Adding products to cart: ", add);

//         for (const sku of add) {
//           const [product] = await db
//             .select({ id: products.id, price: products.price })
//             .from(products)
//             .where(eq(products.sku, sku));

//           if (product) {
//             const [existingCartProduct] = await db
//               .select()
//               .from(cartProduct)
//               .where(
//                 and(
//                   eq(cartProduct.cartId, cart.id),
//                   eq(cartProduct.productId, product.id)
//                 )
//               );

//             if (existingCartProduct) {
//               // If the product is already in the cart, increment the quantity
//               await db
//                 .update(cartProduct)
//                 .set({ quantity: existingCartProduct.quantity + 1 })
//                 .where(eq(cartProduct.id, existingCartProduct.id));
//             } else {
//               // If the product is not in the cart, add it
//               await db.insert(cartProduct).values({
//                 id: uuidv4(),
//                 cartId: cart.id,
//                 productId: product.id,
//                 price: product.price,
//                 quantity: 1,
//               });
//             }
//           }
//         }
//         console.log("Products added to cart");
//       }

//       if (remove && remove.length > 0) {
//         console.log("Removing products from cart: ", remove);

//         const productsToRemove = await db
//           .select({ id: products.id })
//           .from(products)
//           .where(inArray(products.sku, remove));

//         const productIdsToRemove = productsToRemove.map((p) => p.id);

//         await db
//           .delete(cartProduct)
//           .where(
//             and(
//               eq(cartProduct.cartId, cart.id),
//               inArray(cartProduct.productId, productIdsToRemove)
//             )
//           );
//         console.log("Products removed from cart");
//       }

//       if (update && update.length > 0) {
//         console.log("Updating product quantities in cart: ", update);

//         for (const { sku, quantity } of update) {
//           const [product] = await db
//             .select({ id: products.id })
//             .from(products)
//             .where(eq(products.sku, sku));

//           if (product) {
//             await db
//               .update(cartProduct)
//               .set({ quantity })
//               .where(
//                 and(
//                   eq(cartProduct.cartId, cart.id),
//                   eq(cartProduct.productId, product.id)
//                 )
//               );
//           }
//         }

//         console.log("Product quantities updated");
//       }

//       console.log("Fetching updated cart");
//       const updatedCart = await db
//         .select({
//           cartId: carts.id,
//           userId: carts.userId,
//           productId: products.id,
//           productSku: products.sku,
//           productName: products.name,
//           productPrice: products.price,
//           productImageURL: products.imageURL,
//           quantity: cartProduct.quantity,
//         })
//         .from(carts)
//         .where(eq(carts.id, cart.id))
//         .leftJoin(cartProduct, eq(carts.id, cartProduct.cartId))
//         .leftJoin(products, eq(cartProduct.productId, products.id));

//       // Transform the result to match the expected format
//       const formattedCart = {
//         cartId: cart.id,
//         userId: cart.userId,
//         items: updatedCart.map((item) => ({
//           sku: item.productSku,
//           name: item.productName,
//           price: item.productPrice,
//           imageURL: item.productImageURL,
//           qty: item.quantity,
//         })),
//       };

//       return res.json(formattedCart);
//     } catch (error) {
//       console.error("Error Updating cart: ", error);
//       res.status(500).json({ error: "Failed to update cart" });
//     }
//   }
// );

app.patch(
  "/v1/cart",
  authenticateToken,
  async (req: Request<{}, {}, CartUpdateRequest>, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.userId as string;

    const { add, remove, update } = req.body;
    console.log("Request Body: ", req.body);

    try {
      console.log("Attempting to find or create cart of userId: ", userId);
      let [cart] = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId));

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
                eq(cartProduct.productId, product.id)
              )
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
              inArray(cartProduct.productId, productIdsToRemove)
            )
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
                  eq(cartProduct.productId, product.id)
                )
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
  }
);
// Submit an order
app.post(
  "/v1/order",
  authenticateToken,
  async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const userId = req.user.userId as string;
    // const cartId = req.body.cartId as string;
    //* THIS FINDS THE cart id
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
    console.log("Found THE FUCKING CART: ", cart);
    //*
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
  }
);

app.put("/v1/cart", authenticateToken, async (req: Request, res: Response) => {
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
});
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
