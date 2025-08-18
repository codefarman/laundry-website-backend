import express from 'express';
import {
  getProfile,
  updateContactDetails,
  addAddress,
  updateAddress,
  deleteAddress,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../controllers/profile.js';

const router = express.Router();

router.get('/', getProfile);
router.patch('/contact', updateContactDetails);
router.post('/addresses', addAddress);
router.patch('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/payment-methods', addPaymentMethod);
router.patch('/payment-methods/:paymentId', updatePaymentMethod);
router.delete('/payment-methods/:paymentId', deletePaymentMethod);

export default router;