import LaundryService from '../models/laundry-service.js';

export const getServices = async (req, res) => {
  try {
    const services = await LaundryService.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};