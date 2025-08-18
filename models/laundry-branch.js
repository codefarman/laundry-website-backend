import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String }, // e.g., "Downtown Dubai"
}, { timestamps: true });

export default mongoose.model('LaundryBranch', branchSchema);