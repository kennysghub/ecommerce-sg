import express from 'express';
import { getOrderHistory, submitOrder } from '../controllers/orderController';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();

router.post('/', authenticateToken, submitOrder);

//* New route
router.get('/history', authenticateToken, getOrderHistory);

export default router;
