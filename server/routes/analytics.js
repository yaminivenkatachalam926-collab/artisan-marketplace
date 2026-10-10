const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, allow } = require('../middleware/auth');

// Artisan sales analytics
router.get('/artisan', protect, allow('artisan'), async (req, res) => {
  const id = req.user._id;
  const rows = await Order.aggregate([
    { $match: { 'items.artisan': id } },
    { $unwind: '$items' },
    { $match: { 'items.artisan': id, 'items.status': { $ne: 'cancelled' } } },
    { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, title: '$items.title', qty: '$items.qty', revenue: { $multiply: ['$items.price', '$items.qty'] } } },
  ]);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const unitsSold = rows.reduce((s, r) => s + r.qty, 0);
  const byDay = {}; const byProduct = {};
  rows.forEach((r) => {
    byDay[r.day] = (byDay[r.day] || 0) + r.revenue;
    byProduct[r.title] = byProduct[r.title] || { title: r.title, units: 0, revenue: 0 };
    byProduct[r.title].units += r.qty; byProduct[r.title].revenue += r.revenue;
  });
  const productCount = await Product.countDocuments({ artisan: id });
  res.json({
    totalRevenue, unitsSold, productCount, orderLines: rows.length,
    daily: Object.entries(byDay).sort().map(([date, revenue]) => ({ date, revenue })),
    topProducts: Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
  });
});

module.exports = router;
