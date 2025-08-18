import express from 'express';
import Branch from '../models/BranchModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({});
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
});

export default router;