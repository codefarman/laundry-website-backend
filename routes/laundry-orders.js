import express from 'express';
import { getOrdersByBranch, getRecentOrders, updateOrder, getOrderById, confirmOrder, getUserOrders } from '../controllers/laundry-order.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/branch/:branchId', authMiddleware, getOrdersByBranch);
router.get('/recent', authMiddleware, getRecentOrders);
router.get('/user', authMiddleware, getUserOrders); 
router.get('/:orderId', authMiddleware, getOrderById);
router.patch('/:orderId', authMiddleware, updateOrder);
router.post('/:orderId/confirm', authMiddleware, confirmOrder);

export default router;