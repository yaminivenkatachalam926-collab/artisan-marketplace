const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, craft: u.craft, bio: u.bio, location: u.location, community: u.community });

router.post('/register', async (req, res) => {
  const { name, email, password, role, craft, location } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'An account with this email already exists' });
  const user = await User.create({
    name, email, password,
    role: role === 'artisan' ? 'artisan' : 'customer', // admin can never self-register
    craft, location,
  });
  res.status(201).json({ token: sign(user._id), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) return res.status(401).json({ message: 'Incorrect email or password' });
  if (user.isBlocked) return res.status(403).json({ message: 'This account has been blocked' });
  res.json({ token: sign(user._id), user: publicUser(user) });
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/me', protect, async (req, res) => {
  ['name', 'craft', 'bio', 'location', 'community'].forEach((k) => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  await req.user.save();
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
