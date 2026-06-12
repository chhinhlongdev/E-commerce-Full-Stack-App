import { describe, it, expect } from 'vitest';

// Test Product schema shape without a real DB connection
describe('Product schema (unit)', () => {
  it('virtual image returns first element of images array', async () => {
    const Product = (await import('../../models/Product.js')).default;
    const p = new Product({
      name:   'Test Product',
      price:  9.99,
      images: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'],
    });
    expect(p.image).toBe('https://cdn.example.com/a.jpg');
  });

  it('virtual image returns empty string when images is empty', async () => {
    const Product = (await import('../../models/Product.js')).default;
    const p = new Product({ name: 'No Image', price: 5, images: [] });
    expect(p.image).toBe('');
  });

  it('fails validation when name is missing', async () => {
    const Product = (await import('../../models/Product.js')).default;
    const p = new Product({ price: 10 });
    const err = p.validateSync();
    expect(err?.errors?.name).toBeDefined();
  });

  it('fails validation when price is missing', async () => {
    const Product = (await import('../../models/Product.js')).default;
    const p = new Product({ name: 'Valid Name' });
    const err = p.validateSync();
    expect(err?.errors?.price).toBeDefined();
  });

  it('defaults stock to 0', async () => {
    const Product = (await import('../../models/Product.js')).default;
    const p = new Product({ name: 'Item', price: 1 });
    expect(p.stock).toBe(0);
  });

  it('toJSON includes virtual image field', async () => {
    const Product = (await import('../../models/Product.js')).default;
    const p = new Product({ name: 'Item', price: 5, images: ['https://img.com/x.jpg'] });
    const json = p.toJSON();
    expect(json.image).toBe('https://img.com/x.jpg');
  });
});
