const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const artisans = await User.find({ role: 'artisan', isBlocked: false }).select('name craft bio location community createdAt');
  const counts = await Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$artisan', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(artisans.map((a) => ({ ...a.toObject(), productCount: map[String(a._id)] || 0 })));
});

router.get('/:id', async (req, res) => {
  const artisan = await User.findOne({ _id: req.params.id, role: 'artisan' }).select('name craft bio location community createdAt');
  if (!artisan) return res.status(404).json({ message: 'Artisan not found' });
  const products = await Product.find({ artisan: artisan._id, isActive: true }).sort({ createdAt: -1 });
  res.json({ artisan, products });
});

module.exports = router;
