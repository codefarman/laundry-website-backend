import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true }, // e.g., "AED 5", "AED 15-20"
  note: { type: String }, // e.g., "* Price varies by size"
});

const serviceSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true }, // e.g., "Wash & Fold"
  description: { type: String, required: true }, // e.g., "Fresh cleaning for your daily laundry needs."
  icon: { type: String, required: true }, // e.g., "fas fa-shirt"
  items: [itemSchema],
}, { timestamps: true });

export default mongoose.model('LaundryService', serviceSchema);