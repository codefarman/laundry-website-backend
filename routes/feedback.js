import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createFeedback, getFeedback, getFeedbackById, updateFeedbackStatus } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', authMiddleware, createFeedback);
router.get('/', authMiddleware, getFeedback);
router.get('/:feedbackId', authMiddleware, getFeedbackById);
router.patch('/:feedbackId/status', authMiddleware, updateFeedbackStatus);

export default router;