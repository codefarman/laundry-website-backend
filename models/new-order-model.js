import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  calculatedPrice: { type: String },
});

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  items: [itemSchema],
  address: { type: String, required: true },
  contact: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['cod'], default: 'cod', required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Confirmed', 'Picked Up', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  confirmation: {
    method: { type: String, enum: ['phone', 'email'] },
    notes: String,
    confirmedAt: Date,
  },
}, { timestamps: true });

export default mongoose.model('NewOrder', orderSchema);