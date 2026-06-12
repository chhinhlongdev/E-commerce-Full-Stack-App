'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: '📊' },
  { href: '/admin/products', label: 'Products',   icon: '📦' },
  { href: '/admin/orders',   label: 'Orders',     icon: '🧾' },
  { href: '/admin/settings', label: 'Settings',   icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {!collapsed && <span className="font-bold text-white text-base">🛍 Admin Panel</span>}
          <button onClick={() => setCollapsed(c => !c)}
            className="text-gray-400 hover:text-white transition text-lg ml-auto">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <span className="text-base shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className={`p-3 border-t border-gray-800 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed && (
            <p className="text-xs text-gray-500 px-3 mb-2 truncate">{user.name}</p>
          )}
          <button onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition w-full">
            <span className="shrink-0">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
          <Link href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition">
            <span className="shrink-0">🏪</span>
            {!collapsed && <span>View Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-sm text-gray-400">
            {NAV.find(n => n.href === pathname)?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {user.name[0].toUpperCase()}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
