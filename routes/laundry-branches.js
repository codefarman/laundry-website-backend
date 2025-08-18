import express from 'express';
import { getBranches } from '../controllers/laundry-branch.js';

const router = express.Router();

router.get('/', getBranches);

export default router;