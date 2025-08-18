import mongoose from 'mongoose';
import NewOrder from '../models/new-order-model.js';
import { sendNotification } from '../utils/notifications.js';
import { wss } from '../server.js';

export const getOrdersByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    if (!mongoose.isValidObjectId(branchId)) {
      return res.status(400).json({ message: 'Invalid branch ID format' });
    }
    const orders = await NewOrder.find({ branchId })
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 });
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      services: order.items,
      total: order.totalAmount,
    }));
    res.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders by branch:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = status ? { status } : {};
    const sort = { [sortBy === 'total' ? 'totalAmount' : sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const orders = await NewOrder.find(query)
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      services: order.items,
      total: order.totalAmount,
    }));
    res.json(transformedOrders || []);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    const order = await NewOrder.findById(orderId)
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const transformedOrder = {
      ...order.toObject(),
      services: order.items,
      total: order.totalAmount,
    };
    res.json(transformedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    if (!req.user?._id) {
      console.error('getUserOrders: No user ID found in req.user', req.user);
      return res.status(401).json({ message: 'Authentication required' });
    }
    const query = { customerId: req.user._id }; 
    if (status) {
      if (!['Pending', 'Processing', 'Confirmed', 'Picked Up', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      query.status = status;
    }
    const orders = await NewOrder.find(query)
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const transformedOrders = orders.map(order => ({
      id: order._id.toString(),
      date: order.createdAt,
      status: order.status,
      total: order.totalAmount,
      items: order.items.map(item => ({
        service: item.title,
        quantity: 1, // Assuming one unit per item; adjust if quantity is stored
        price: parseFloat(item.price),
      })),
    }));
    res.json(transformedOrders || []);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    if (!['Pending', 'Processing', 'Confirmed', 'Picked Up', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await NewOrder.findByIdAndUpdate(
      orderId,
      { status, updatedAt: Date.now() },
      { new: true }
    )
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (wss && wss.clients) {
      const wsMessage = {
        type: 'ORDER_UPDATE',
        data: { 
          customerId: order.customerId?._id, 
          orderId: order._id, 
          status: order.status, 
          branchId: { _id: order.branchId?._id, name: order.branchId?.name },
        },
      };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(wsMessage));
        }
      });
    } else {
      console.warn('WebSocket server (wss) is not initialized; skipping notification');
    }

    try {
      await sendNotification(order.customerId?._id, `Order ${order._id} status updated to ${order.status} at ${order.branchId?.name || 'Unknown Branch'}.`);
    } catch (notificationError) {
      console.warn('Notification failed:', notificationError.message);
    }

    const transformedOrder = {
      ...order.toObject(),
      services: order.items,
      total: order.totalAmount,
    };

    res.json({
      message: `Order status updated to ${status}`,
      order: {
        _id: transformedOrder._id,
        total: transformedOrder.total,
        status: transformedOrder.status,
        services: transformedOrder.services,
        customer: transformedOrder.contact?.name,
        branchId: transformedOrder.branchId,
      },
    });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: 'Server error updating order', error: error.message });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { contactMethod, notes } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    if (!['phone', 'email'].includes(contactMethod)) {
      return res.status(400).json({ message: 'Invalid contact method' });
    }

    const order = await NewOrder.findByIdAndUpdate(
      orderId,
      {
        status: 'Confirmed',
        confirmation: { method: contactMethod, notes, confirmedAt: Date.now() },
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (wss && wss.clients) {
      const wsMessage = {
        type: 'ORDER_UPDATE',
        data: { 
          customerId: order.customerId?._id, 
          orderId: order._id, 
          status: 'Confirmed', 
          branchId: { _id: order.branchId?._id, name: order.branchId?.name },
        },
      };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(wsMessage));
        }
      });
    } else {
      console.warn('WebSocket server (wss) is not initialized; skipping notification');
    }

    try {
      await sendNotification(order.customerId?._id, `Order ${order._id} confirmed via ${contactMethod} at ${order.branchId?.name || 'Unknown Branch'}.`);
    } catch (notificationError) {
      console.warn('Notification failed:', notificationError.message);
    }

    const transformedOrder = {
      ...order.toObject(),
      services: order.items,
      total: order.totalAmount,
    };

    res.json({
      message: 'Order confirmed',
      order: transformedOrder,
    });
  } catch (error) {
    console.error('Order confirmation error:', error);
    res.status(500).json({ message: 'Server error confirming order', error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, branchId, status, sortBy = 'createdAt', sortOrder = 'desc', timeFilter } = req.query;
    const query = {};

    if (branchId) {
      query.branchId = branchId;
    }
    if (status) {
      query.status = status;
    }
    if (timeFilter) {
      const now = new Date();
      let startDate;
      switch (timeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'last24hours':
          startDate = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case 'last7days':
          startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const sort = { [sortBy === 'total' ? 'totalAmount' : sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const orders = await NewOrder.find(query)
      .populate('customerId', 'name email phone')
      .populate('branchId', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await NewOrder.countDocuments(query);

    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      services: order.items,
      total: order.totalAmount,
    }));

    res.json({ orders: transformedOrders, total });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};