'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addItem } = useCart();

  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    api.get(`/products?${params}`)
      .then(r => setProducts(r.data.products))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products {category && `— ${category}`}</h1>
        <input
          type="text" placeholder="Search products..."
          className="border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <Link href={`/products/${p._id}`}>
                <img src={p.image || '/placeholder.png'} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="font-semibold text-gray-800 truncate">{p.name}</h2>
                  <p className="text-blue-600 font-bold mt-1">${p.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <button
                  onClick={() => addItem(p)}
                  disabled={p.stock === 0}
                  className="w-full bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="col-span-4 text-center text-gray-400 py-16">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-64" />
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
