import express from 'express';
import { createBooking } from '../controllers/new-booking-controller.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);

export default router;