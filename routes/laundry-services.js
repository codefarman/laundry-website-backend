import express from 'express';
import { getServices } from '../controllers/laundry-services.js';

const router = express.Router();

router.get('/', getServices);

export default router;