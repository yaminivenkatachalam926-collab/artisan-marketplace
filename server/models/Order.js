const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  image: String,
  price: Number,
  qty: { type: Number, min: 1 },
  status: { type: String, enum: ['placed', 'packed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [itemSchema],
  total: Number,
  shipping: { name: String, phone: String, address: String, city: String, pincode: String },
  paymentMethod: { type: String, default: 'COD' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
