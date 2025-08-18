import express from 'express';
import { getCustomers, updateCustomer } from '../controllers/customers.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getCustomers);
router.patch('/:id', authMiddleware, updateCustomer);

export default router;