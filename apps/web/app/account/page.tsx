'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import TabProfile from './components/TabProfile';
import TabOrders from './components/TabOrders';
import TabAddresses from './components/TabAddresses';

const TABS = [
  { id: 'profile',   label: 'Profile',    icon: '👤' },
  { id: 'orders',    label: 'My Orders',  icon: '🧾' },
  { id: 'addresses', label: 'Addresses',  icon: '📍' },
];

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
            : user.name[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition
              ${tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === 'profile'   && <TabProfile />}
        {tab === 'orders'    && <TabOrders />}
        {tab === 'addresses' && <TabAddresses />}
      </div>
    </div>
  );
}
