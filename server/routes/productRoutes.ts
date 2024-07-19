import express from 'express';
import { getProducts } from '../controllers/productController';
// import { authenticateToken } from "../middleware/authenticateToken";

const router = express.Router();

router.get('/', getProducts);

export default router;
