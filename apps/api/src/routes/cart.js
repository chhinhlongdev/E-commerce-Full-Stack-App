const router = require('express').Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Cart is stored client-side (localStorage), this endpoint validates & calculates
// POST /api/cart/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!items?.length) return res.json({ items: [], total: 0 });

    let total = 0;
    const validated = await Promise.all(items.map(async ({ productId, quantity }) => {
      const product = await Product.findById(productId);
      if (!product) return null;
      const qty = Math.min(quantity, product.stock);
      total += product.price * qty;
      return { product, quantity: qty };
    }));

    res.json({ items: validated.filter(Boolean), total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
