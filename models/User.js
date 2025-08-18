import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  area: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const paymentMethodSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true }, // Store last 4 digits only
  expiry: { type: String, required: true },
  cvv: { type: String }, // Optional, avoid storing in production
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  facebookId: { type: String },
  appleId: { type: String },
  phone: { type: String },
  company: { type: String },
  vatNumber: { type: String },
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Export the model
export default mongoose.models.User || mongoose.model('User', userSchema);