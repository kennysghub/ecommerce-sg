import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db/db";
import { products } from "./db/schema";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/products", async (_req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products);
    return res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const newProduct = req.body;
    const result = await db.insert(products).values(newProduct);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
