'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Order } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',  dot: '🟡' },
  processing: { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200',        dot: '🔵' },
  shipped:    { label: 'Shipped',    color: 'bg-purple-50 text-purple-700 border-purple-200',  dot: '🟣' },
  delivered:  { label: 'Delivered',  color: 'bg-green-50 text-green-700 border-green-200',     dot: '🟢' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200',           dot: '🔴' },
};

export default function TabOrders() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const LIMIT = 5;

  useEffect(() => {
    setLoading(true);
    api.get(`/profile/orders?page=${page}&limit=${LIMIT}`)
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const pages = Math.ceil(total / LIMIT);

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-20 bg-white rounded-2xl border">
      <p className="text-4xl mb-3">🛒</p>
      <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
      <a href="/products" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700">
        Start Shopping
      </a>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Order History</h2>
        <span className="text-sm text-gray-400">{total} orders</span>
      </div>

      {orders.map(order => {
        const s      = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-50 text-gray-700 border-gray-200', dot: '⚪' };
        const isOpen = expanded === order._id;
        return (
          <div key={order._id} className="bg-white rounded-2xl border overflow-hidden">
            {/* Summary row */}
            <div className="p-5 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('km-KH', { dateStyle: 'medium' })}</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${s.color}`}>
                  {s.dot} {s.label}
                </span>
                <p className="text-blue-600 font-bold text-lg">${order.total.toFixed(2)}</p>
                <button onClick={() => setExpanded(isOpen ? null : order._id)}
                  className="text-sm text-blue-600 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition">
                  {isOpen ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t bg-gray-50 p-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                          <span className="text-gray-800 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold text-sm">
                        <span>Total</span>
                        <span className="text-blue-600">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Delivery Address</p>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>{order.address.street}</p>
                      <p>{order.address.city}, {order.address.country}</p>
                      <p className="text-gray-400">{order.address.zip}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-400">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition">
              ← Prev
            </button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
