const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { protect, allow } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ai = require('../services/ai');

// ---- Public: browse with search / filter / sort / paging
router.get('/', async (req, res) => {
  const { q, category, minPrice, maxPrice, artisan, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };
  if (q && q.trim()) {
    const safeQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(safeQ, 'i');
    filter.$or = [
      { title: rx },
      { materials: rx },
      { keywords: rx },
      { category: rx },
    ];
  }
  if (category && category !== 'All') filter.category = category;
  if (artisan) filter.artisan = artisan;
  if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  const sorts = { newest: { createdAt: -1 }, 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, popular: { sold: -1 } };
  const skip = (Math.max(+page, 1) - 1) * +limit;
  const [products, total] = await Promise.all([
    Product.find(filter).populate('artisan', 'name location craft').sort(sorts[sort] || sorts.newest).skip(skip).limit(+limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, pages: Math.ceil(total / +limit) });
});

router.get('/meta', (req, res) => res.json({ categories: ai.CATEGORIES, languages: ai.LANGUAGES }));

// ---- Artisan: own products (must come before /:id)
router.get('/mine/all', protect, allow('artisan'), async (req, res) => {
  res.json(await Product.find({ artisan: req.user._id }).sort({ createdAt: -1 }));
});

// ---- AI: generate description + keywords (optionally from an uploaded photo)
router.post('/ai/generate', protect, allow('artisan', 'admin'), upload.single('image'), async (req, res) => {
  const { title, materials, category, notes } = req.body;
  if (!title) return res.status(400).json({ message: 'Add a product title first' });
  const languages = (req.body.languages || 'en').split(',');
  try {
    const result = await ai.generate({ title, materials, category, notes, languages, imagePath: req.file?.path });
    res.json(result);
  } catch (err) {
    res.status(502).json({ message: `AI generation failed: ${err.message}. You can still write the description yourself.` });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {}); // temp image only used for AI
  }
});

router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).populate('artisan', 'name location craft bio community');
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
});

router.post('/', protect, allow('artisan'), upload.array('images', 5), async (req, res) => {
  const { title, price, stock, category, materials, keywords, descriptions } = req.body;
  if (!title || price === undefined) return res.status(400).json({ message: 'Title and price are required' });
  const product = await Product.create({
    artisan: req.user._id, title, price: +price, stock: +stock || 1, category, materials,
    images: (req.files || []).map((f) => `/uploads/${f.filename}`),
    keywords: keywords ? JSON.parse(keywords) : [],
    descriptions: descriptions ? JSON.parse(descriptions) : {},
  });
  res.status(201).json(product);
});

router.put('/:id', protect, allow('artisan'), upload.array('images', 5), async (req, res) => {
  const p = await Product.findOne({ _id: req.params.id, artisan: req.user._id });
  if (!p) return res.status(404).json({ message: 'Product not found' });
  const { title, price, stock, category, materials, keywords, descriptions, isActive } = req.body;
  if (title !== undefined) p.title = title;
  if (price !== undefined) p.price = +price;
  if (stock !== undefined) p.stock = +stock;
  if (category !== undefined) p.category = category;
  if (materials !== undefined) p.materials = materials;
  if (isActive !== undefined) p.isActive = isActive === 'true' || isActive === true;
  if (keywords) p.keywords = JSON.parse(keywords);
  if (descriptions) p.descriptions = JSON.parse(descriptions);
  if (req.files?.length) p.images = [...p.images, ...req.files.map((f) => `/uploads/${f.filename}`)].slice(0, 5);
  await p.save();
  res.json(p);
});

router.delete('/:id', protect, allow('artisan', 'admin'), async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, artisan: req.user._id };
  const p = await Product.findOneAndDelete(filter);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  p.images.forEach((img) => fs.unlink(path.join(__dirname, '..', img), () => {}));
  res.json({ message: 'Product deleted' });
});

module.exports = router;
