import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = 'adminPassword123';

    // Delete existing admin user to reset
    await User.deleteOne({ email: adminEmail });
    console.log('Cleared existing admin user:', adminEmail);

    // Create new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully:', { email: adminEmail, role: 'admin', passwordHash: hashedPassword });
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();