import { db } from "./db";
import { products, users, carts, cartProduct, orders } from "./schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Use these types instead of InferModel
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type Cart = typeof carts.$inferSelect;
type NewCart = typeof carts.$inferInsert;
type Product = typeof products.$inferSelect;
type NewProduct = typeof products.$inferInsert;
const seedData = {
  products: [
    {
      sku: "item0001",
      name: "Dyson Outsize plus",
      price: 450,
      imageURL:
        "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/hero/448114-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=1920",
      description:
        "Dyson power in a larger format. For large-home deep cleans without the cord",
    },
    {
      sku: "item0002",
      name: "Bissel CleanView Swivel Pet",
      price: 118,
      imageURL:
        "https://m.media-amazon.com/images/I/71pzkmU3PuL._AC_SL1500_.jpg",
      description:
        "Clean multiple surfaces throughout your home with this powerful vacuum cleaner.",
    },
    {
      sku: "item0003",
      name: "Bissel Featherweight Stick",
      price: 29,
      imageURL:
        "https://m.media-amazon.com/images/I/71Ajq3rQuOL._AC_SL1500_.jpg",
      description:
        " The Featherweight lightweight stick vacuum gives you convenient and effective cleaning on carpets, area rugs, bare floors, stairs, upholstery and more it easily converts from a stick vacuum to a hand vacuum to clean anywhere in your home. Because the featherweight is ultra-lightweight and compact it is easy to use and easy to store. Power source - corded. Power rating-2 Amps.",
    },
    {
      sku: "item0004",
      name: "Shark Pet Cordless Stick",
      price: 149,
      imageURL:
        "https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6359/6359269_sd.jpg;maxHeight=2000;maxWidth=2000",
      description:
        "The Shark Cordless Pet Plus Vacuum with Anti-Allergen Complete Seal combines powerful suction with cordless convenience to deliver deep cleaning on all floor types. Its lightweight design and removable hand vac allow for cleaning from floor to ceiling.",
    },
    {
      sku: "item0005",
      name: "LVAC-200 Cordless Vacuum",
      price: 199,
      imageURL:
        "https://levoit.com/cdn/shop/files/lvac-200-cordless-vacuum-437899.jpg?v=1715751607&width=768",
      description:
        "Bring your home to life with the LVAC-200 Cordless Stick Vacuum. From its tangle-resistant design to its 5-stage filtration process, every feature was designed to help you clean the gray away.",
    },
    {
      sku: "item0006",
      name: "Black+Decker SUMMITSERIES Select Cordless Stick",
      price: 299,
      imageURL:
        "https://cdn.shopify.com/s/files/1/0640/1409/0461/files/4832d80ef30d1304fc97b45d211ccdbd1c92c8b7.jpg",
      description:
        "Experience the cleaning power of the BLACK+DECKER® SUMMITSERIES™ select Cordless Stick Vacuum. With the MOST SUCTION OF ANY BLACK+DECKER® CORDLESS STICK VACUUM* the powerful brushless motor helps tackle dirt, dust + debris across multiple surfaces in your home. The easy-to-emtpy 750ml dustbowl allows for simple disposal of dirt + debris. The cordless and portable design makes it easy to clean and manuever. With easy clean ups you can get back to doing what you love. Easy By Design™.",
    },
  ],
  users: [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: "password123",
    },
    { name: "Bob Smith", email: "bob@example.com", password: "password456" },
    {
      name: "Charlie Brown",
      email: "charlie@example.com",
      password: "password789",
    },
  ],
};

async function seedDatabase() {
  try {
    // Seed products
    for (const product of seedData.products) {
      await db.insert(products).values({
        id: uuidv4(),
        sku: product.sku,
        name: product.name,
        price: product.price,
        imageURL: product.imageURL,
        description: product.description,
      } as NewProduct);
    }
    console.log("Products seeded successfully");

    // Seed users
    const seededUsers: User[] = [];
    for (const user of seedData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const [seededUser] = await db
        .insert(users)
        .values({
          id: uuidv4(), // This matches server-side user creation
          name: user.name,
          email: user.email,
          password: hashedPassword,
        } as NewUser)
        .returning();
      seededUsers.push(seededUser);
    }
    console.log("Users seeded successfully");

    // Seed carts and cart_product
    for (const user of seededUsers) {
      const [cart] = await db
        .insert(carts)
        .values({
          id: uuidv4(),
          userId: user.id,
        } as NewCart)
        .returning();

      // Add random products to each cart
      const randomProducts = seedData.products
        .sort(() => 0.5 - Math.random())
        .slice(0, 2); // This adds 2 random products to each cart.

      for (const product of randomProducts) {
        const [dbProduct] = await db
          .select()
          .from(products)
          .where(eq(products.sku, product.sku))
          .limit(1);
        if (dbProduct) {
          await db.insert(cartProduct).values({
            id: uuidv4(),
            cartId: cart.id,
            productId: dbProduct.id,
          });
        }
      }
    }
    console.log("Carts and cart products seeded successfully");

    // Seed orders
    for (const user of seededUsers) {
      const [userCart] = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, user.id))
        .limit(1);
      if (userCart) {
        const cartItems = await db
          .select({
            productId: products.id,
            productPrice: products.price,
          })
          .from(cartProduct)
          .where(eq(cartProduct.cartId, userCart.id))
          .innerJoin(products, eq(cartProduct.productId, products.id));

        const totalAmount = cartItems.reduce(
          (sum, item) => sum + item.productPrice,
          0
        );

        await db.insert(orders).values({
          id: uuidv4(),
          userId: user.id,
          cartId: userCart.id,
          transactionId: uuidv4(),
          amount: totalAmount,
        });
      }
    }
    console.log("Orders seeded successfully");

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
