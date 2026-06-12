'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Address } from '@/lib/types';

const emptyAddr = { label: 'Home', street: '', city: '', district: '', province: '', country: 'Cambodia', zip: '', isDefault: false };

export default function TabAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editAddr,  setEditAddr]  = useState<Address | null>(null);
  const [form,      setForm]      = useState({ ...emptyAddr });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const fetchAddresses = () =>
    api.get('/profile/addresses').then(r => { setAddresses(r.data); setLoading(false); });

  useEffect(() => { fetchAddresses(); }, []);

  const openAdd = () => { setForm({ ...emptyAddr }); setEditAddr(null); setShowForm(true); setError(''); };
  const openEdit = (a: Address) => { setForm({ ...a }); setEditAddr(a); setShowForm(true); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editAddr) {
        await api.put(`/profile/addresses/${editAddr._id}`, form);
      } else {
        await api.post('/profile/addresses', form);
      }
      setShowForm(false);
      fetchAddresses();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await api.delete(`/profile/addresses/${id}`);
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    await api.patch(`/profile/addresses/${id}/default`);
    fetchAddresses();
  };

  if (loading) return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[1, 2].map(i => <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Shipping Addresses</h2>
        <button onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          + Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-3xl mb-2">📍</p>
          <p className="text-gray-500 text-sm">No saved addresses yet.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map(addr => (
          <div key={addr._id}
            className={`relative bg-white rounded-2xl border-2 p-5 transition
              ${addr.isDefault ? 'border-blue-500 shadow-blue-100 shadow-md' : 'border-gray-100'}`}>
            {addr.isDefault && (
              <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                ✓ Default
              </span>
            )}
            <p className="font-semibold text-gray-800 mb-1">📍 {addr.label}</p>
            <p className="text-sm text-gray-600">{addr.street}</p>
            <p className="text-sm text-gray-500">{[addr.district, addr.city, addr.province].filter(Boolean).join(', ')}</p>
            <p className="text-sm text-gray-500">{addr.country} {addr.zip}</p>

            <div className="flex gap-2 mt-4 flex-wrap">
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr._id)}
                  className="text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                  Set Default
                </button>
              )}
              <button onClick={() => openEdit(addr)}
                className="text-xs text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                Edit
              </button>
              <button onClick={() => handleDelete(addr._id)}
                className="text-xs text-red-400 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">{editAddr ? 'Edit Address' : 'New Address'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">❌ {error}</p>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Label (e.g. Home, Office)</label>
                <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Street / House No. *</label>
                <input required value={form.street} onChange={e => setForm({ ...form, street: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">District / Khan</label>
                  <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">City *</label>
                  <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Province / State</label>
                  <input value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">ZIP Code</label>
                  <input value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Country *</label>
                <input required value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
