import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth Middleware: Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Auth Middleware: No token provided or invalid format');
    return res.status(401).json({ message: 'No token provided or invalid format' });
  }

  const token = authHeader.split('Bearer ')[1];
  console.log('Auth Middleware: Token extracted:', token);

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET);
    console.log('Auth Middleware: Token decoded:', decoded);

    // Verify user exists in database
    const user = await User.findById(decoded.id);
    if (!user) {
      console.error('Auth Middleware: User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = { _id: user._id, email: user.email, role: user.role };
    console.log('Auth Middleware: User set:', req.user);

    // Restrict /admin/* routes to admin role
    if (req.path.startsWith('/admin') && decoded.role !== 'admin') {
      console.error('Auth Middleware: Access denied, user is not an admin');
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    next();
  } catch (error) {
    console.error('Auth Middleware: Token verification failed:', error.message, error.stack);
    return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
  }
};

export default authMiddleware;