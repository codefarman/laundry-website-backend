import mongoose from 'mongoose';
import NewOrder from '../models/new-order-model.js';
import Branch from '../models/BranchModel.js';
import { sendNotification } from '../utils/notifications.js';
import { wss } from '../server.js';

export const createBooking = async (req, res) => {
  try {
    const { address, services, contact, paymentMethod, total, branchId } = req.body;

    // Log incoming request details
    console.log('createBooking: Received request with token:', req.header('Authorization'));
    console.log('createBooking: Decoded user:', req.user);

    // Validate authentication
    const userId = req.user?._id || req.user?.id; // Support both _id and id
    if (!userId) {
      console.error('createBooking: No user ID found in req.user', req.user);
      return res.status(401).json({ message: 'Authentication required: No user ID found' });
    }

    // Validate inputs
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: 'Services must be a non-empty array' });
    }
    if (!contact?.name || !contact?.phone || !contact?.email) {
      return res.status(400).json({ message: 'Contact name, phone, and email are required' });
    }
    if (!total) {
      return res.status(400).json({ message: 'Total amount is required' });
    }
    if (!branchId) {
      return res.status(400).json({ message: 'Branch ID is required' });
    }

    // Validate payment method
    if (paymentMethod !== 'cod') {
      return res.status(400).json({ message: 'Only Cash on Delivery is supported' });
    }

    // Validate branchId
    if (!mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID format' });
    }
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Validate contact
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    const phoneRegex = /^\+971[5|4]\d{8}$/;
    if (!phoneRegex.test(contact.phone)) {
      return res.status(400).json({ message: 'Invalid UAE phone number (e.g., +971501234567)' });
    }

    // Validate services
    const items = services.map((service, index) => {
      if (!service.title || !service.price || typeof service.price !== 'string') {
        throw new Error(`Invalid service at index ${index}: title and price (string) required`);
      }
      return {
        title: service.title,
        price: service.price,
        calculatedPrice: service.calculatedPrice,
      };
    });

    // Validate total
    const totalFloat = parseFloat(total);
    if (isNaN(totalFloat) || totalFloat <= 0) {
      return res.status(400).json({ message: 'Total amount must be a positive number' });
    }

    // Create order
    const order = new NewOrder({
      customerId: userId, // Use the resolved userId
      branchId,
      items,
      address,
      contact,
      paymentMethod: 'cod',
      totalAmount: totalFloat,
      status: 'Pending',
    });

    await order.save();
    console.log('createBooking: Order saved:', order._id);

    // WebSocket notification
    if (wss && wss.clients) {
      const wsMessage = {
        type: 'NEW_ORDER',
        data: { customerId: userId, orderId: order._id, status: order.status, branchId },
      };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(wsMessage));
          console.log('createBooking: WebSocket message sent:', wsMessage);
        }
      });
    } else {
      console.warn('createBooking: WebSocket server (wss) is not initialized; skipping notification');
    }

    // Customer notification
    try {
      await sendNotification(userId, `Order ${order._id} created with status ${order.status}.`);
      console.log('createBooking: Notification sent to user:', userId);
    } catch (notificationError) {
      console.warn('createBooking: Notification failed:', notificationError.message);
    }

    res.status(201).json({
      message: 'Booking created successfully.',
      order: {
        _id: order._id,
        branch: branch.name,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('createBooking: Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    if (error instanceof mongoose.Error.CastError && error.path === '_id') {
      return res.status(400).json({ message: 'Invalid branch ID format' });
    }
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};