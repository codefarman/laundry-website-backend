import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('adminPassword123', 10);
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@example.com' },
      { $set: { password: hashedPassword, role: 'admin' } }
    );
    console.log('Update result:', result);
    if (result.matchedCount === 0) {
      console.log('No user found with email: admin@example.com');
    } else {
      console.log('Password and role updated for admin@example.com');
    }
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateAdminPassword();