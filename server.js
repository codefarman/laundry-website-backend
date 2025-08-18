import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import WebSocket, { WebSocketServer } from 'ws';
import orderRoutes from './routes/laundry-orders.js';
import serviceRoutes from './routes/laundry-services.js';
import branchRoutes from './routes/new-branch-route.js';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/auth.js';
import { sendNotification } from './utils/notifications.js';
import newBookingRoutes from './routes/new-booking-route.js';
import customerRoutes from './routes/customers.js';
import profileRoutes from './routes/profile.js';
import feedbackRoutes from './routes/feedback.js';
import { getAllOrders } from './controllers/laundry-order.js';
import './utils/passport.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/orders', authMiddleware, getAllOrders);
app.use('/api/services', serviceRoutes);
app.use('/api/branches', authMiddleware, branchRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/booking', newBookingRoutes);
app.use('/api/profile', authMiddleware, profileRoutes); // Explicitly ensure profile routes are protected
app.use('/api/feedback', authMiddleware, feedbackRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// WebSocket Setup
export let wss;
try {
  wss = new WebSocketServer({ port: 8080 });
  global.wss = wss;
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('message', (message) => {
      try {
        const { type, data } = JSON.parse(message);
        if (['ORDER_UPDATE', 'NEW_ORDER', 'NEW_FEEDBACK', 'FEEDBACK_UPDATE', 'PROFILE_UPDATE'].includes(type)) {
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type, data }));
            }
          });
          if (type === 'PROFILE_UPDATE') {
            sendNotification(data.userId, 'Your profile has been updated.');
          } else if (type === 'NEW_ORDER') {
            sendNotification(data.customerId, `New order ${data._id} placed at ${data.branchId?.name || 'Unknown Branch'}.`);
          } else if (type === 'NEW_FEEDBACK') {
            sendNotification(data.userId, 'Your feedback has been submitted.');
          } else if (type === 'ORDER_UPDATE') {
            sendNotification(data.customerId, `Order ${data._id} status updated to ${data.status}.`);
          } else if (type === 'FEEDBACK_UPDATE') {
            sendNotification(data.userId, `Your feedback status has been updated to ${data.status}.`);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    ws.on('close', () => console.log('WebSocket client disconnected'));
  });
  wss.on('error', (error) => console.error('WebSocket server error:', error));
} catch (error) {
  console.error('Failed to start WebSocket server:', error);
}

// Stats Endpoint
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const todayOrders = await mongoose.model('NewOrder').countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });
    const revenue = await mongoose.model('NewOrder').aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: { $convert: { input: '$totalAmount', to: 'double', onError: 0 } } } } },
    ]);
    const users = await mongoose.model('User').countDocuments();
    const pending = await mongoose.model('NewOrder').countDocuments({ status: 'Pending' });
    res.json({
    todayOrders,
      revenue: revenue[0]?.total || 0,
      customers: users,
      pending,
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(port, () => console.log(`Server running on port ${port}`));