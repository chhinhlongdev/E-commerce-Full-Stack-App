'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todaySales: number;
  todayOrders: number;
}

interface RecentOrder {
  _id: string;
  user: { name: string; email: string } | null;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-blue-500/10 text-blue-400',
  shipped:    'bg-purple-500/10 text-purple-400',
  delivered:  'bg-green-500/10 text-green-400',
  cancelled:  'bg-red-500/10 text-red-400',
};

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [recent, setRecent] = useState<RecentOrder[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=1'),
      api.get('/orders?limit=5'),
      api.get('/orders?limit=1000'),
    ]).then(([pr, recentRes, allRes]) => {
      const orders    = allRes.data.orders || [];
      const today     = new Date(); today.setHours(0, 0, 0, 0);
      const todayOrds = orders.filter((o: any) => new Date(o.createdAt) >= today);

      setStats({
        totalProducts: pr.data.total || 0,
        totalOrders:   allRes.data.total || 0,
        totalRevenue:  orders.reduce((s: number, o: any) => s + o.total, 0),
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        todaySales:    todayOrds.reduce((s: number, o: any) => s + o.total, 0),
        todayOrders:   todayOrds.length,
      });
      setRecent(recentRes.data.orders || []);
    });
  }, []);

  const CARDS = [
    { label: 'Total Revenue',   value: stats ? `$${stats.totalRevenue.toFixed(2)}` : '—', sub: 'All time',       icon: '💰', color: 'from-blue-600 to-blue-800' },
    { label: "Today's Sales",   value: stats ? `$${stats.todaySales.toFixed(2)}`   : '—', sub: `${stats?.todayOrders ?? 0} orders`, icon: '📈', color: 'from-emerald-600 to-emerald-800' },
    { label: 'Pending Orders',  value: stats?.pendingOrders ?? '—',                        sub: 'Needs attention', icon: '⏳', color: 'from-amber-600 to-amber-800' },
    { label: 'Total Products',  value: stats?.totalProducts ?? '—',                        sub: 'In catalog',      icon: '📦', color: 'from-purple-600 to-purple-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{c.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{c.value}</p>
                <p className="text-white/60 text-xs mt-1">{c.sub}</p>
              </div>
              <span className="text-3xl">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Orders</h2>
          <a href="/admin/orders" className="text-blue-400 text-sm hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recent.map(o => (
                <tr key={o._id} className="hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 font-mono text-gray-300 text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-white">{o.user?.name ?? 'N/A'}</td>
                  <td className="px-6 py-4 text-emerald-400 font-semibold">${o.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-700 text-gray-300'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
