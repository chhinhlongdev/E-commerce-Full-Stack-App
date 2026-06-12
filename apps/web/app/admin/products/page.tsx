'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';

const LIMIT = 8;
const emptyForm = { name: '', description: '', price: 0, stock: 0, category: '', images: [] as string[] };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [form,     setForm]     = useState(emptyForm);
  const [editId,   setEditId]   = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [formErr,  setFormErr]  = useState('');

  const fetchProducts = (p = page, s = search) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (s) params.set('search', s);
    api.get(`/products?${params}`).then(r => {
      setProducts(r.data.products);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { fetchProducts(page, search); }, [page]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProducts(1, search); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const pages = Math.ceil(total / LIMIT);

  // Build FormData from form state (images are already Cloudinary URLs at this point)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setFormErr('');
    try {
      // Images are already uploaded URLs — send as JSON field
      const payload = {
        name:        form.name,
        description: form.description,
        price:       form.price,
        stock:       form.stock,
        category:    form.category,
        images:      form.images,
      };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchProducts();
    } catch (err: any) {
      setFormErr(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description,
      price: p.price, stock: p.stock, category: p.category,
      images: p.images?.length ? p.images : (p.image ? [p.image] : []),
    });
    setEditId(p._id); setShowForm(true); setFormErr('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} total products</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); setFormErr(''); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          + Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products by name..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Product', 'Category', 'Price', 'Stock', 'Images', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.map(p => {
              const imgs = p.images?.length ? p.images : (p.image ? [p.image] : []);
              return (
                <tr key={p._id} className="hover:bg-gray-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={imgs[0] || 'https://placehold.co/48'} alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-700 shrink-0" />
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">{p.category || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-emerald-400 font-semibold">${p.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${p.stock === 0 ? 'bg-red-500/10 text-red-400' : p.stock < 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Stacked mini thumbnails */}
                    <div className="flex -space-x-2">
                      {imgs.slice(0, 3).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-7 h-7 rounded-full border-2 border-gray-900 object-cover" />
                      ))}
                      {imgs.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-400">
                          +{imgs.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)}
                        className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/40 transition">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p._id)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-500">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition">
              ← Prev
            </button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-700 transition">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-xl shadow-2xl my-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>

            {formErr && (
              <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                ❌ {formErr}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic fields */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Electronics, Clothing..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Price (USD) *</label>
                  <input type="number" required min={0} step="0.01" value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Stock *</label>
                  <input type="number" required min={0} value={form.stock}
                    onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>

              {/* Image uploader */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Product Images (max 5)</label>
                <ImageUploader
                  value={form.images}
                  onChange={imgs => setForm({ ...form, images: imgs })}
                  maxImages={5}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition text-sm">
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg font-medium transition text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
