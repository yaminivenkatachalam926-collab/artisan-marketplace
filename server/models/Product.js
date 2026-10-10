const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 1, min: 0 },
  category: { type: String, default: 'Other', index: true },
  materials: { type: String, default: '' },
  images: [String],
  // Descriptions keyed by language code: { en: '...', ta: '...', hi: '...' }
  descriptions: { type: Map, of: String, default: {} },
  keywords: [String],
  isActive: { type: Boolean, default: true },
  sold: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ title: 'text', keywords: 'text', materials: 'text' });
module.exports = mongoose.model('Product', productSchema);
