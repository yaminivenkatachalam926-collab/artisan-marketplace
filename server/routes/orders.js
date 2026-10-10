const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, allow } = require('../middleware/auth');

// Customer: place order from cart  [{ productId, qty }]
router.post('/', protect, allow('customer'), async (req, res) => {
  const { items, shipping } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Your cart is empty' });
  if (!shipping?.name || !shipping?.address || !shipping?.phone) return res.status(400).json({ message: 'Please complete the shipping details' });

  const lines = [];
  for (const { productId, qty } of items) {
    const p = await Product.findById(productId);
    if (!p || !p.isActive) return res.status(400).json({ message: 'A product in your cart is no longer available' });
    if (p.stock < qty) return res.status(400).json({ message: `Only ${p.stock} left of "${p.title}"` });
    lines.push({ p, qty: +qty });
  }
  // Decrement stock atomically-ish
  for (const { p, qty } of lines) { p.stock -= qty; p.sold += qty; await p.save(); }

  const order = await Order.create({
    customer: req.user._id,
    shipping,
    items: lines.map(({ p, qty }) => ({ product: p._id, artisan: p.artisan, title: p.title, image: p.images[0], price: p.price, qty })),
    total: lines.reduce((s, { p, qty }) => s + p.price * qty, 0),
  });
  res.status(201).json(order);
});

router.get('/mine', protect, allow('customer'), async (req, res) => {
  res.json(await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }));
});

// Artisan: order lines that contain their products
router.get('/artisan', protect, allow('artisan'), async (req, res) => {
  const orders = await Order.find({ 'items.artisan': req.user._id }).populate('customer', 'name email').sort({ createdAt: -1 });
  res.json(orders.map((o) => ({
    _id: o._id, createdAt: o.createdAt, shipping: o.shipping, customer: o.customer,
    items: o.items.filter((i) => String(i.artisan) === String(req.user._id)),
  })));
});

router.put('/:orderId/items/:itemId/status', protect, allow('artisan'), async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  const item = order?.items.id(req.params.itemId);
  if (!item || String(item.artisan) !== String(req.user._id)) return res.status(404).json({ message: 'Order item not found' });
  item.status = req.body.status;
  await order.save();
  res.json(item);
});

// Customer cancels an item that is still 'placed'
router.put('/:orderId/items/:itemId/cancel', protect, allow('customer'), async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, customer: req.user._id });
  const item = order?.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Order item not found' });
  if (item.status !== 'placed') return res.status(400).json({ message: 'This item has already been packed and can no longer be cancelled' });
  item.status = 'cancelled';
  await order.save();
  await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, sold: -item.qty } });
  res.json(item);
});

module.exports = router;
