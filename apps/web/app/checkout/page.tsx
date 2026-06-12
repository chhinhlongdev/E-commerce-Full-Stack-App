'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState({ street: '', city: '', country: '', zip: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    router.push('/login');
    return null;
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: items.map(i => ({ productId: i.product._id, quantity: i.quantity })),
        address,
        paymentMethod,
      });
      clearCart();
      router.push('/orders/success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleOrder} className="space-y-4">
          <h2 className="font-semibold text-lg">Delivery Address</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {(['street', 'city', 'country', 'zip'] as const).map(field => (
            <input key={field} required
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={address[field]} onChange={e => setAddress({ ...address, [field]: e.target.value })}
            />
          ))}

          <h2 className="font-semibold text-lg pt-4">Payment Method</h2>
          <div className="space-y-2">
            {[{ value: 'cod', label: 'Cash on Delivery' }, { value: 'card', label: 'Credit Card (coming soon)' }].map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="payment" value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={e => setPaymentMethod(e.target.value)}
                  disabled={opt.value === 'card'}
                />
                <span className={opt.value === 'card' ? 'text-gray-400' : ''}>{opt.label}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition mt-4">
            {loading ? 'Placing order...' : `Place Order — $${total.toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="flex justify-between">
                <span className="text-gray-600">{product.name} × {quantity}</span>
                <span className="font-medium">${(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
