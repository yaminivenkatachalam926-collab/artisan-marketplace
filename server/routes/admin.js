const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, allow } = require('../middleware/auth');

router.use(protect, allow('admin'));

router.get('/stats', async (req, res) => {
  const [customers, artisans, products, orders, revenueAgg, byCategory] = await Promise.all([
    User.countDocuments({ role: 'customer' }), User.countDocuments({ role: 'artisan' }),
    Product.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $unwind: '$items' }, { $match: { 'items.status': { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } }]),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  res.json({ customers, artisans, products, orders, revenue: revenueAgg[0]?.total || 0, byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })) });
});

router.get('/users', async (req, res) => res.json(await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 })));
router.put('/users/:id/block', async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: { $ne: 'admin' } });
  if (!u) return res.status(404).json({ message: 'User not found' });
  u.isBlocked = !u.isBlocked; await u.save();
  res.json({ _id: u._id, isBlocked: u.isBlocked });
});
router.get('/products', async (req, res) => res.json(await Product.find().populate('artisan', 'name').sort({ createdAt: -1 })));
router.put('/products/:id/toggle', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  p.isActive = !p.isActive; await p.save();
  res.json({ _id: p._id, isActive: p.isActive });
});
router.get('/orders', async (req, res) => res.json(await Order.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(100)));

module.exports = router;
