import express from 'express';
import { submitOrder } from '../controllers/orderController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();

router.post('/', authenticateToken, submitOrder);

export default router;
