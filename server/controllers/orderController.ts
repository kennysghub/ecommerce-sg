import { Request, Response } from 'express';
import { db } from '../db/db';
import { carts, cartProduct, orders, products, orderItem } from '../db/schema';
import { eq, and } from 'drizzle-orm/expressions';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: jwt.JwtPayload & { userId: string };
}

export const submitOrder = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userId = req.user.userId as string;

  // This finds the cart id
  let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));

  const cartId = cart.id;
  if (!cartId) {
    return res.status(400).json({ error: 'cartId is required' });
  }

  try {
    console.log(`Submitting order for user ${userId} with cart ${cartId}`);

    // Verify the cart belongs to the user
    const [userCart] = await db
      .select()
      .from(carts)
      .where(and(eq(carts.id, cartId), eq(carts.userId, userId)));

    if (!userCart) {
      return res.status(404).json({ error: 'Cart not found for this user' });
    }

    // Get everything in the cart
    const cartItems = await db
      .select({
        cartProductId: cartProduct.id,
        productId: products.id,
        productPrice: products.price,
        quantity: cartProduct.quantity,
      })
      .from(cartProduct)
      .where(eq(cartProduct.cartId, cartId))
      .leftJoin(products, eq(cartProduct.productId, products.id));

    console.log(`Found ${cartItems.length} items in the cart`);
    console.log('Cart items:', cartItems);

    // Calculate total amount, filtering out any null products
    const totalAmount = cartItems.reduce((sum, item) => {
      if (item.productId && item.productPrice && item.quantity) {
        return sum + item.productPrice * item.quantity;
      }
      return sum;
    }, 0);

    console.log(`Total order amount: ${totalAmount}`);
    cartItems.forEach((item) => {
      console.log(
        `Product ID: ${item.productId}, Price: ${item.productPrice}, Quantity: ${item.quantity}`,
      );
    });

    // Submit the order
    const [newOrder] = await db
      .insert(orders)
      .values({
        id: uuidv4(),
        userId,
        cartId,
        transactionId: uuidv4(),
        amount: totalAmount,
      })
      .returning();

    //* Insert items into the orderItem table
    const orderItemPromises = cartItems.map(async (item) => {
      if (item.productId && item.productPrice && item.quantity) {
        return db.insert(orderItem).values({
          id: uuidv4(),
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.productPrice,
        });
      }
    });

    await Promise.all(orderItemPromises);

    console.log(`New order created with ID: ${newOrder.id}`);

    // Clear the cart after submitting the order
    await db.delete(cartProduct).where(eq(cartProduct.cartId, cartId));
    console.log(`Cleared cart ${cartId}`);
    console.log('New Order TransactionID: ', newOrder.transactionId);
    console.log('New Order Amount: ', newOrder.amount);

    return res.json(newOrder);
  } catch (error) {
    console.error('Error submitting order:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Failed to submit order' });
  }
};

export const getOrderHistory = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userId = req.user.userId as string;

  try {
    // Selecting fields from tables: orders, orderItem, and products, starting from orders table.
    // We filter orders for the specific user.
    // Then we perform a left join with the orderItem table, and then another left join with products table.
    // This gets us a list of each order item.
    const userOrders = await db
      .select({
        orderId: orders.id,
        transactionId: orders.transactionId,
        amount: orders.amount,
        createdAt: orders.createdAt,
        productId: products.id,
        productName: products.name,
        quantity: orderItem.quantity,
        price: orderItem.price,
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .leftJoin(orderItem, eq(orders.id, orderItem.orderId))
      .leftJoin(products, eq(orderItem.productId, products.id));
    console.log(userOrders);

    // Transform the data.
    // We take the list of order items,and convert it into a structured list of orders, where each order contains all of the items.
    // Iterate over each order in userOrders.
    const groupedOrders = userOrders.reduce((acc, order) => {
      const existingOrder = acc.find((o) => o.orderId === order.orderId);
      // For each order, we check if an order with the same orderId already exists in our accumulator, if we find an order, that means this current iteration is dealing with an item from that same order.
      if (existingOrder) {
        if (order.productId) {
          // Only add the item if productId is not null
          existingOrder.items.push({
            productId: order.productId,
            productName: order.productName,
            quantity: order.quantity,
            price: order.price,
          });
        }
      } else {
        // If we didn't find an order with the same orderId, then this is a new order so we create a new object with all of the order details.
        acc.push({
          orderId: order.orderId,
          transactionId: order.transactionId,
          amount: order.amount,
          createdAt: order.createdAt,
          items: order.productId
            ? [
                {
                  // Only add the item if productId is not null, ran into some errors.
                  productId: order.productId,
                  productName: order.productName,
                  quantity: order.quantity,
                  price: order.price,
                },
              ]
            : [],
        });
      }
      return acc;
    }, [] as any[]);

    return res.json(groupedOrders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Failed to fetch order history' });
  }
};
