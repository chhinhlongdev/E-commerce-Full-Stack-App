const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendTelegramNotification } = require('../utils/telegram');

// POST /api/orders — Create order (checkout)
router.post('/', protect, async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;
    if (!items?.length || !address) 
      return res.status(400).json({ message: 'Items and address are required' });

    // Validate products & calculate total
    let total = 0;
    const orderItems = await Promise.all(items.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId);
      if (!product) throw new Error(`Product ${productId} not found`);
      if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.name}`);
      total += product.price * quantity;
      // Decrease stock
      await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
      return { product: product._id, name: product.name, price: product.price, quantity };
    }));

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      address,
      paymentMethod: paymentMethod || 'cod',
    });

    // Populate user info for the Telegram message, then notify (non-blocking)
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');
    sendTelegramNotification(populatedOrder).catch(err =>
      console.error('[Telegram] Unexpected error:', err.message)
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/my — User's own orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders — Admin: all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const [orders, total] = await Promise.all([
      Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — Admin: update status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
