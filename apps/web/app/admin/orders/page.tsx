'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Order } from '@/lib/types';

const LIMIT = 10;

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  shipped:    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  delivered:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border border-red-500/20',
};

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [filter,  setFilter]  = useState('');
  const [search,  setSearch]  = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = (p = page, f = filter) => {
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) });
    if (f) params.set('status', f);
    api.get(`/orders?${params}`).then(r => {
      setOrders(r.data.orders || []);
      setTotal(r.data.total || 0);
    });
  };

  useEffect(() => { setPage(1); fetchOrders(1, filter); }, [filter]);
  useEffect(() => { fetchOrders(page, filter); }, [page]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  const pages = Math.ceil(total / LIMIT);

  // client-side search by order ID or customer name
  const visible = search
    ? orders.filter(o => {
        const u = typeof o.user === 'object' ? o.user : null;
        return o._id.toLowerCase().includes(search.toLowerCase())
          || u?.name?.toLowerCase().includes(search.toLowerCase())
          || u?.email?.toLowerCase().includes(search.toLowerCase());
      })
    : orders;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or order ID..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition
                ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {visible.map(order => {
              const user = typeof order.user === 'object' ? order.user : null;
              const isOpen = expanded === order._id;
              return (
                <>
                  <tr key={order._id} className="hover:bg-gray-800/40 transition cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : order._id)}>
                    <td className="px-5 py-3.5 font-mono text-gray-300 text-xs">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{user?.name ?? 'N/A'}</p>
                      <p className="text-gray-500 text-xs">{user?.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">{order.items.length} item(s)</td>
                    <td className="px-5 py-3.5 text-emerald-400 font-semibold">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${order._id}-detail`} className="bg-gray-800/30">
                      <td colSpan={7} className="px-8 py-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Items</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-gray-300 py-1 border-b border-gray-700 last:border-0">
                                <span>{item.name} × {item.quantity}</span>
                                <span className="text-emerald-400">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Delivery</p>
                            <p className="text-gray-300">{order.address.street}</p>
                            <p className="text-gray-300">{order.address.city}, {order.address.country} {order.address.zip}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-500">No orders found.</td></tr>
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
    </div>
  );
}
