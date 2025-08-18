import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true }, // e.g., "AED 5"
  calculatedPrice: { type: String }, // e.g., "AED 225" for bulk items
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'LaundryBranch', required: true },
  items: [itemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Completed', 'Cancelled'] },
}, { timestamps: true });

export default mongoose.model('LaundryOrder', orderSchema);