'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-4xl mb-4">🛒</p>
        <p className="text-gray-500 mb-6">Your cart is empty</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:underline">Clear all</button>
      </div>

      <div className="space-y-4 mb-8">
        {items.map(({ product, quantity }) => (
          <div key={product._id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
            <img src={product.image || '/placeholder.png'} alt={product.name}
              className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-blue-600">${product.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => updateQty(product._id, quantity - 1)} className="px-3 py-1.5 hover:bg-gray-100">−</button>
              <span className="px-3 py-1.5 border-x">{quantity}</span>
              <button onClick={() => updateQty(product._id, quantity + 1)} className="px-3 py-1.5 hover:bg-gray-100">+</button>
            </div>
            <p className="w-20 text-right font-semibold">${(product.price * quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(product._id)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</p>
        </div>
        <Link href="/checkout"
          className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition">
          Checkout →
        </Link>
      </div>
    </div>
  );
}
