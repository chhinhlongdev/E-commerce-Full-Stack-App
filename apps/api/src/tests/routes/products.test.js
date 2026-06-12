/**
 * Products route tests — pure logic tests without real DB
 * Tests auth guards, input validation, and mock handler behavior
 */
import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt     from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const adminToken = () => jwt.sign({ id: 'a1', role: 'admin' }, SECRET, { expiresIn: '1h' });
const userToken  = () => jwt.sign({ id: 'u1', role: 'user'  }, SECRET, { expiresIn: '1h' });

// ── Inline auth middleware (matches real implementation) ──
function protect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

// ── Build a mock product app (no mongoose) ─────────────
function buildProductApp() {
  const app = express();
  app.use(express.json());

  const mockProducts = [
    { _id: 'p1', name: 'Phone Case', price: 9.99, stock: 10, images: [], category: 'test' },
    { _id: 'p2', name: 'USB Cable',  price: 4.99, stock: 0,  images: [], category: 'test' },
  ];

  // GET — public
  app.get('/api/products', (_req, res) => {
    res.json({ products: mockProducts, total: mockProducts.length, page: 1 });
  });

  // GET by id — public
  app.get('/api/products/:id', (req, res) => {
    const p = mockProducts.find(x => x._id === req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  });

  // POST — admin only
  app.post('/api/products', protect, adminOnly, (req, res) => {
    const { name, price } = req.body;
    if (!name || price === undefined) return res.status(400).json({ message: 'Name and price required' });
    res.status(201).json({ _id: 'new1', ...req.body, images: [] });
  });

  // PUT — admin only
  app.put('/api/products/:id', protect, adminOnly, (req, res) => {
    res.json({ _id: req.params.id, ...req.body });
  });

  // DELETE — admin only
  app.delete('/api/products/:id', protect, adminOnly, (_req, res) => {
    res.json({ message: 'Product deleted' });
  });

  return app;
}

describe('GET /api/products', () => {
  it('200 — returns product list publicly', async () => {
    const res = await request(buildProductApp()).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.total).toBe(2);
  });
});

describe('GET /api/products/:id', () => {
  it('200 — returns product by id', async () => {
    const res = await request(buildProductApp()).get('/api/products/p1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Phone Case');
  });

  it('404 — unknown id', async () => {
    const res = await request(buildProductApp()).get('/api/products/unknown');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/products', () => {
  it('401 without token', async () => {
    const res = await request(buildProductApp())
      .post('/api/products').send({ name: 'X', price: 5 });
    expect(res.status).toBe(401);
  });

  it('403 for regular user', async () => {
    const res = await request(buildProductApp())
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ name: 'X', price: 5 });
    expect(res.status).toBe(403);
  });

  it('400 when name missing', async () => {
    const res = await request(buildProductApp())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ price: 9.99 });
    expect(res.status).toBe(400);
  });

  it('201 — admin creates product', async () => {
    const res = await request(buildProductApp())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'New Item', price: 9.99, stock: 5, category: 'general' });
    expect(res.status).toBe(201);
    expect(res.body._id).toBe('new1');
  });
});

describe('PUT /api/products/:id', () => {
  it('401 without token', async () => {
    const res = await request(buildProductApp())
      .put('/api/products/p1').send({ price: 12 });
    expect(res.status).toBe(401);
  });

  it('403 for regular user', async () => {
    const res = await request(buildProductApp())
      .put('/api/products/p1')
      .set('Authorization', `Bearer ${userToken()}`)
      .send({ price: 12 });
    expect(res.status).toBe(403);
  });

  it('200 — admin updates product', async () => {
    const res = await request(buildProductApp())
      .put('/api/products/p1')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ name: 'Updated', price: 12.99 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });
});

describe('DELETE /api/products/:id', () => {
  it('401 without token', async () => {
    const res = await request(buildProductApp())
      .delete('/api/products/p1');
    expect(res.status).toBe(401);
  });

  it('200 — admin deletes product', async () => {
    const res = await request(buildProductApp())
      .delete('/api/products/p1')
      .set('Authorization', `Bearer ${adminToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Product deleted');
  });
});
