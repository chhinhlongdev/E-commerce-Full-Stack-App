const router = require('express').Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');

// ── helpers ──────────────────────────────────────────────

/**
 * Resolve final images array from:
 *  - uploaded files  (req.files)
 *  - imageUrl string (req.body.imageUrl) — single URL paste
 *  - images array    (req.body.images)   — existing URLs on edit
 */
async function resolveImages(req) {
  const urls = [];

  // 1. Files uploaded via multipart
  if (req.files?.length) {
    const uploaded = await Promise.all(
      req.files.map(f => uploadToCloudinary(f.buffer))
    );
    urls.push(...uploaded);
  }

  // 2. Single URL pasted by admin
  if (req.body.imageUrl?.trim()) {
    urls.push(req.body.imageUrl.trim());
  }

  // 3. Existing images array kept on edit (sent as JSON string or array)
  if (req.body.images) {
    const existing = Array.isArray(req.body.images)
      ? req.body.images
      : JSON.parse(req.body.images);
    urls.push(...existing.filter(Boolean));
  }

  return urls;
}

// ── routes ───────────────────────────────────────────────

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.name = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(filter).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products — Admin only (multipart/form-data OR json)
router.post('/', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    if (!name || price === undefined) return res.status(400).json({ message: 'Name and price are required' });

    const images = await resolveImages(req);

    const product = await Product.create({
      name, description, price: Number(price),
      stock: Number(stock) || 0, category, images,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id — Admin only
router.put('/:id', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const images = await resolveImages(req);

    const update = { name, description, category };
    if (price !== undefined) update.price = Number(price);
    if (stock !== undefined) update.stock = Number(stock);
    if (images.length)       update.images = images;

    const product = await Product.findByIdAndUpdate(
      req.params.id, update, { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id — Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/upload-image — standalone image upload, returns URL
router.post('/upload-image', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const url = await uploadToCloudinary(req.file.buffer);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
