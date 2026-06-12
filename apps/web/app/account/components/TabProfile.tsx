'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type Mode = 'view' | 'edit' | 'password';

export default function TabProfile() {
  const { user, updateUser } = useAuth();
  const [mode, setMode] = useState<Mode>('view');

  // Edit profile state
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true); setProfileErr(''); setProfileMsg('');
    try {
      const { data } = await api.patch('/profile', form);
      updateUser({ name: data.name, phone: data.phone, avatar: data.avatar });
      setProfileMsg('Profile updated successfully!');
      setMode('view');
    } catch (err: any) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErr(''); setPwdMsg('');
    if (pwd.newPwd !== pwd.confirm) return setPwdErr('New passwords do not match');
    setSavingPwd(true);
    try {
      const { data } = await api.patch('/profile/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      setPwdMsg(data.message);
      setPwd({ current: '', newPwd: '', confirm: '' });
      setMode('view');
    } catch (err: any) {
      setPwdErr(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPwd(false); }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Left — Avatar + basic info */}
      <div className="bg-white rounded-2xl border p-6 flex flex-col items-center text-center gap-3">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-blue-50 shadow">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            : <span className="text-4xl font-bold text-blue-600">{user?.name[0].toUpperCase()}</span>}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.phone && <p className="text-gray-400 text-sm mt-0.5">📞 {user.phone}</p>}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
          {user?.role === 'admin' ? '⚙️ Admin' : '🛍 Customer'}
        </span>
        <div className="flex flex-col gap-2 w-full mt-2">
          <button onClick={() => setMode('edit')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            ✏️ Edit Profile
          </button>
          <button onClick={() => setMode('password')}
            className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
            🔒 Change Password
          </button>
        </div>
      </div>

      {/* Right — Edit form OR Password form OR Info display */}
      <div className="md:col-span-2 bg-white rounded-2xl border p-6">

        {mode === 'view' && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-5">Account Information</h2>
            {profileMsg && <p className="text-green-600 text-sm mb-4 bg-green-50 px-4 py-2 rounded-lg">✅ {profileMsg}</p>}
            {pwdMsg    && <p className="text-green-600 text-sm mb-4 bg-green-50 px-4 py-2 rounded-lg">✅ {pwdMsg}</p>}
            <dl className="space-y-4">
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email Address', value: user?.email },
                { label: 'Phone Number', value: user?.phone || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3 border-b last:border-0">
                  <dt className="text-sm text-gray-500">{label}</dt>
                  <dd className="text-sm font-medium text-gray-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {mode === 'edit' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Edit Profile</h2>
              <button onClick={() => setMode('view')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            </div>
            {profileErr && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">❌ {profileErr}</p>}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+855 XX XXX XXX"
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
                <input value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://..."
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingProfile}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setMode('view')}
                  className="flex-1 border text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {mode === 'password' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Change Password</h2>
              <button onClick={() => setMode('view')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            </div>
            {pwdErr && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">❌ {pwdErr}</p>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'newPwd',  label: 'New Password (min 6 chars)' },
                { key: 'confirm', label: 'Confirm New Password' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type="password" required minLength={key !== 'current' ? 6 : 1}
                    value={(pwd as any)[key]}
                    onChange={e => setPwd({ ...pwd, [key]: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingPwd}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
                  {savingPwd ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => setMode('view')}
                  className="flex-1 border text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
