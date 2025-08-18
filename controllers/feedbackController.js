import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import { wss } from '../server.js';

export const createFeedback = async (req, res) => {
  try {
    const { name, email, message, category } = req.body;
    console.log('createFeedback: Received data', { name, email, message, category, userId: req.user?._id });

    // Validate input
    if (!name?.trim() || !email?.trim() || !message?.trim() || !category) {
      console.error('createFeedback: Validation failed, missing fields');
      return res.status(400).json({ message: 'All fields (name, email, message, category) are required' });
    }
    if (!['Complaint', 'Suggestion', 'Question'].includes(category)) {
      console.error('createFeedback: Invalid category', category);
      return res.status(400).json({ message: 'Invalid category. Must be Complaint, Suggestion, or Question' });
    }
    if (!req.user?._id) {
      console.error('createFeedback: User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!mongoose.isValidObjectId(req.user._id)) {
      console.error('createFeedback: Invalid user ID', req.user._id);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const feedback = new Feedback({
      userId: req.user._id,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      category,
      status: 'Open',
    });

    await feedback.save();
    console.log('createFeedback: Feedback saved', feedback);

    // Notify admins via WebSocket
    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'NEW_FEEDBACK', data: feedback }));
        }
      });
    } else {
      console.warn('createFeedback: WebSocket server not initialized');
    }

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('createFeedback: Error', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFeedback = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.error('getFeedback: Access denied, user is not an admin', req.user);
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10, status } = req.query;
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      console.error('getFeedback: Invalid page or limit', { page, limit });
      return res.status(400).json({ message: 'Invalid page or limit parameters' });
    }
    if (status && !['Open', 'Resolved'].includes(status)) {
      console.error('getFeedback: Invalid status', status);
      return res.status(400).json({ message: 'Invalid status. Must be Open or Resolved' });
    }
    const query = status ? { status } : {};
    const feedback = await Feedback.find(query)
      .populate('userId', 'name email')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Feedback.countDocuments(query);
    res.json({ feedback, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('getFeedback: Error', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFeedbackById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.error('getFeedbackById: Access denied, user is not an admin', req.user);
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { feedbackId } = req.params;
    if (!mongoose.isValidObjectId(feedbackId)) {
      console.error('getFeedbackById: Invalid feedback ID', feedbackId);
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    const feedback = await Feedback.findById(feedbackId).populate('userId', 'name email');
    if (!feedback) {
      console.error('getFeedbackById: Feedback not found', feedbackId);
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('getFeedbackById: Error', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      console.error('updateFeedbackStatus: Access denied, user is not an admin', req.user);
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { feedbackId } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(feedbackId)) {
      console.error('updateFeedbackStatus: Invalid feedback ID', feedbackId);
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }
    if (!['Open', 'Resolved'].includes(status)) {
      console.error('updateFeedbackStatus: Invalid status', status);
      return res.status(400).json({ message: 'Invalid status. Must be Open or Resolved' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name email');

    if (!feedback) {
      console.error('updateFeedbackStatus: Feedback not found', feedbackId);
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Notify admins via WebSocket
    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'FEEDBACK_UPDATE', data: feedback }));
        }
      });
    } else {
      console.warn('updateFeedbackStatus: WebSocket server not initialized');
    }

    res.json({ message: 'Feedback status updated', feedback });
  } catch (error) {
    console.error('updateFeedbackStatus: Error', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};