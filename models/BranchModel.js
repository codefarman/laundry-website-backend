import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactNumbers: { type: [String], required: true },
  lat: { type: Number, required: false }, // Optional until seeded
  lng: { type: Number, required: false },
}, { timestamps: true });

export default mongoose.model('Branch', branchSchema);