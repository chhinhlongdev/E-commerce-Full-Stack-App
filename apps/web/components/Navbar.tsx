'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">🛍 MyShop</Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-blue-600">Products</Link>

          <Link href="/cart" className="relative hover:text-blue-600">
            🛒 Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-purple-600 font-medium hover:underline">Admin</Link>
              )}
              <Link href="/account" className="flex items-center gap-1.5 hover:text-blue-600">
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={logout} className="text-red-500 hover:underline text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-600">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
