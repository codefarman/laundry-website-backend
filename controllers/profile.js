import User from '../models/User.js';
import mongoose from 'mongoose';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    console.log('getProfile: req.user', req.user); // Debug log
    console.log('getProfile: Attempting to fetch user', { userId: req.user?._id });
    if (!req.user?._id || !mongoose.isValidObjectId(req.user._id)) {
      console.error('getProfile: Invalid user ID', { userId: req.user?._id });
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      console.error('getProfile: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('getProfile: User fetched successfully', { userId: user._id });
    res.json(user);
  } catch (error) {
    console.error('getProfile: Server error', { error: error.message, userId: req.user?._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update contact details
export const updateContactDetails = async (req, res) => {
  try {
    const { name, phone, company, vatNumber } = req.body;
    console.log('updateContactDetails: Updating user', { userId: req.user._id, updates: { name, phone, company, vatNumber } });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, company, vatNumber },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      console.error('updateContactDetails: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('updateContactDetails: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add address
export const addAddress = async (req, res) => {
  try {
    const { area, street, city, state, zip, isDefault } = req.body;
    if (!area || !street || !city || !state || !zip) {
      console.error('addAddress: Missing required fields', { fields: { area, street, city, state, zip } });
      return res.status(400).json({ message: 'All address fields are required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('addAddress: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newAddress = { area, street, city, state, zip, isDefault };
    if (isDefault) {
      user.addresses = user.addresses.map(addr => ({ ...addr.toObject(), isDefault: false }));
    }
    user.addresses.push(newAddress);
    await user.save();
    
    res.json(user.addresses);
  } catch (error) {
    console.error('addAddress: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { area, street, city, state, zip, isDefault } = req.body;
    if (!mongoose.isValidObjectId(addressId)) {
      console.error('updateAddress: Invalid address ID', { addressId });
      return res.status(400).json({ message: 'Invalid address ID' });
    }
    if (!area || !street || !city || !state || !zip) {
      console.error('updateAddress: Missing required fields', { fields: { area, street, city, state, zip } });
      return res.status(400).json({ message: 'All address fields are required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('updateAddress: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      console.error('updateAddress: Address not found', { addressId, userId: req.user._id });
      return res.status(404).json({ message: 'Address not found' });
    }
    
    if (isDefault) {
      user.addresses = user.addresses.map(addr => ({ ...addr.toObject(), isDefault: false }));
    }
    user.addresses[addressIndex] = { _id: addressId, area, street, city, state, zip, isDefault };
    await user.save();
    
    res.json(user.addresses);
  } catch (error) {
    console.error('updateAddress: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    if (!mongoose.isValidObjectId(addressId)) {
      console.error('deleteAddress: Invalid address ID', { addressId });
      return res.status(400).json({ message: 'Invalid address ID' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('deleteAddress: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      console.error('deleteAddress: Address not found', { addressId, userId: req.user._id });
      return res.status(404).json({ message: 'Address not found' });
    }
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();
    
    res.json(user.addresses);
  } catch (error) {
    console.error('deleteAddress: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add payment method
export const addPaymentMethod = async (req, res) => {
  try {
    const { cardNumber, expiry } = req.body;
    if (!cardNumber || !expiry) {
      console.error('addPaymentMethod: Missing required fields', { fields: { cardNumber, expiry } });
      return res.status(400).json({ message: 'Card number and expiry are required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('addPaymentMethod: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    const lastFour = cardNumber.slice(-4);
    user.paymentMethods.push({ cardNumber: lastFour, expiry });
    await user.save();
    
    res.json(user.paymentMethods);
  } catch (error) {
    console.error('addPaymentMethod: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { cardNumber, expiry } = req.body;
    if (!mongoose.isValidObjectId(paymentId)) {
      console.error('updatePaymentMethod: Invalid payment method ID', { paymentId });
      return res.status(400).json({ message: 'Invalid payment method ID' });
    }
    if (!cardNumber || !expiry) {
      console.error('updatePaymentMethod: Missing required fields', { fields: { cardNumber, expiry } });
      return res.status(400).json({ message: 'Card number and expiry are required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('updatePaymentMethod: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    const paymentIndex = user.paymentMethods.findIndex(pm => pm._id.toString() === paymentId);
    if (paymentIndex === -1) {
      console.error('updatePaymentMethod: Payment method not found', { paymentId, userId: req.user._id });
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    const lastFour = cardNumber.slice(-4);
    user.paymentMethods[paymentIndex] = { _id: paymentId, cardNumber: lastFour, expiry };
    await user.save();
    
    res.json(user.paymentMethods);
  } catch (error) {
    console.error('updatePaymentMethod: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!mongoose.isValidObjectId(paymentId)) {
      console.error('deletePaymentMethod: Invalid payment method ID', { paymentId });
      return res.status(400).json({ message: 'Invalid payment method ID' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('deletePaymentMethod: User not found', { userId: req.user._id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    const paymentIndex = user.paymentMethods.findIndex(pm => pm._id.toString() === paymentId);
    if (paymentIndex === -1) {
      console.error('deletePaymentMethod: Payment method not found', { paymentId, userId: req.user._id });
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    user.paymentMethods = user.paymentMethods.filter(pm => pm._id.toString() !== paymentId);
    await user.save();
    
    res.json(user.paymentMethods);
  } catch (error) {
    console.error('deletePaymentMethod: Server error', { error: error.message, userId: req.user._id });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};