const router = require('express').Router();
const User  = require('../models/User');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET /api/profile — get full profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/profile — update name, phone, avatar
router.patch('/', protect, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)   user.name   = name.trim();
    if (phone !== undefined) user.phone  = phone.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/profile/password — change password
router.patch('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/profile/orders — order history for logged-in user
router.get('/orders', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments({ user: req.user.id }),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Addresses ────────────────────────────────────────────

// GET /api/profile/addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/addresses — add new address
router.post('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = req.body;

    // if this is first address or marked default, clear others
    if (addr.isDefault || user.addresses.length === 0) {
      user.addresses.forEach(a => { a.isDefault = false; });
      addr.isDefault = true;
    }

    user.addresses.push(addr);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/profile/addresses/:addrId — update address
router.put('/addresses/:addrId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ message: 'Address not found' });

    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }
    Object.assign(addr, req.body);
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/profile/addresses/:addrId
router.delete('/addresses/:addrId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addrId);
    // if we deleted the default, promote first remaining
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/profile/addresses/:addrId/default — set as default
router.patch('/addresses/:addrId/default', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.forEach(a => { a.isDefault = a._id.toString() === req.params.addrId; });
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
