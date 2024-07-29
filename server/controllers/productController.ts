import { Request, Response } from 'express';
import { db } from '../db/db';
import { products } from '../db/schema';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products);
    return res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
