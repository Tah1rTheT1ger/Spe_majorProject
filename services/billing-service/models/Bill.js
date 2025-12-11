const mongoose = require('mongoose');
//bfdskhjksdfH
const ItemSchema = new mongoose.Schema({
  description: String,
  cost: { type: Number, required: true, default: 0 },
  qty: { type: Number, default: 1 }
});

const PaymentSchema = new mongoose.Schema({
  amount: Number,
  method: { type: String }, // e.g., 'card', 'cash', 'online'
  paidAt: Date,
  ref: String
});

const BillSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [ItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','paid','cancelled','partial'], default: 'pending' },
  payments: [PaymentSchema],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId }
});

module.exports = mongoose.model('Bill', BillSchema);
