import LaundryBranch from '../models/laundry-branch.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await LaundryBranch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};