// /// <reference path="./express.d.ts" />
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/v1/products', productRoutes);
app.use('/v1/cart', cartRoutes);
app.use('/v1/order', orderRoutes);
app.use('/v1', authRoutes);

app.use((req, res) => res.status(404).send("This is not the page you're looking for..."));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
