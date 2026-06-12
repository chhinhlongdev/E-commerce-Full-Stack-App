'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!product) return <div className="text-center py-32 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-10">
        <img src={product.image || '/placeholder.png'} alt={product.name}
          className="w-full rounded-2xl object-cover aspect-square" />
        <div>
          <span className="text-xs uppercase text-gray-400 tracking-widest">{product.category}</span>
          <h1 className="text-3xl font-bold mt-1 mb-3">{product.name}</h1>
          <p className="text-3xl text-blue-600 font-bold mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-sm text-gray-400 mb-4">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 border-x">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-gray-100">+</button>
            </div>
            <button onClick={handleAdd} disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
