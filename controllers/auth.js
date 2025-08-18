import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import dotenv from 'dotenv';

dotenv.config();

export const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

  if (!name || !email || !password || !confirmPassword) {
    console.log('Signup failed: Missing required fields', { name, email, password, confirmPassword });
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    console.log('Signup failed: Passwords do not match');
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Signup failed: User already exists', { email });
      return res.status(400).json({ message: 'User already exists' });
    }

    const role = email === ADMIN_EMAIL ? 'admin' : 'user';
    const user = new User({ name, email, password, role });
    await user.save();
    console.log('User created:', { email, role });

    const token = generateToken(user);
    res.status(201).json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('Login failed: Email or password missing', { email, password });
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      console.log('Login failed: No password set for user (social login?)', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Password does not match', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful:', { email, role: user.role });
    const token = generateToken(user);
    res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const socialLoginCallback = (req, res) => {
  console.log('Social login callback:', { user: req.user.email, role: req.user.role });
  const token = generateToken(req.user);
  // Updated redirect to frontend port 5173
  res.redirect(`http://localhost:5173/booking?token=${token}`);
};