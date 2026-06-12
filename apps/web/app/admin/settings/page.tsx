'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AdminSettingsPage() {
  const [botToken, setBotToken] = useState('');
  const [chatId,   setChatId]   = useState('');
  const [enabled,  setEnabled]  = useState(true);

  const [saveStatus, setSaveStatus] = useState<Status>('idle');
  const [testStatus, setTestStatus] = useState<Status>('idle');
  const [message,    setMessage]    = useState('');

  // Load current settings
  useEffect(() => {
    api.get('/settings/telegram').then(r => {
      setBotToken(r.data.botToken || '');
      setChatId(r.data.chatId   || '');
      setEnabled(r.data.enabled ?? true);
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('loading'); setMessage('');
    try {
      await api.post('/settings/telegram', { botToken, chatId, enabled });
      setSaveStatus('success'); setMessage('Settings saved successfully!');
    } catch (err: any) {
      setSaveStatus('error'); setMessage(err.response?.data?.message || 'Failed to save');
    }
    setTimeout(() => { setSaveStatus('idle'); setMessage(''); }, 4000);
  };

  const handleTest = async () => {
    setTestStatus('loading'); setMessage('');
    try {
      const { data } = await api.post('/settings/telegram/test');
      setTestStatus('success'); setMessage(data.message);
    } catch (err: any) {
      setTestStatus('error'); setMessage(err.response?.data?.message || 'Test failed');
    }
    setTimeout(() => { setTestStatus('idle'); setMessage(''); }, 5000);
  };

  const isBusy = saveStatus === 'loading' || testStatus === 'loading';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your Telegram bot notification settings</p>
      </div>

      {/* Telegram Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-xl">✈️</div>
            <div>
              <h2 className="font-semibold text-white">Telegram Notifications</h2>
              <p className="text-gray-400 text-xs">Receive new order alerts on Telegram</p>
            </div>
          </div>
          {/* Enable/Disable Toggle */}
          <button onClick={() => setEnabled(e => !e)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none
              ${enabled ? 'bg-blue-600' : 'bg-gray-700'}`}
            aria-label="Toggle notifications">
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
              ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Status banner */}
        <div className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2
          ${enabled ? 'bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/10' : 'bg-amber-500/10 text-amber-400 border-b border-amber-500/10'}`}>
          <span>{enabled ? '🟢' : '🟡'}</span>
          {enabled ? 'Notifications are ENABLED' : 'Notifications are PAUSED'}
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Bot Token
              <span className="ml-2 text-gray-500 text-xs font-normal">from @BotFather</span>
            </label>
            <input
              type="text"
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              placeholder="123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-gray-500 text-xs mt-1">
              Leave unchanged to keep the existing token (shown masked for security).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Chat ID
              <span className="ml-2 text-gray-500 text-xs font-normal">personal or group</span>
            </label>
            <input
              type="text"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              placeholder="-1001234567890"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <p className="text-gray-500 text-xs mt-1">
              Group IDs start with <code className="bg-gray-800 px-1 rounded">-100</code>.
              Use <code className="bg-gray-800 px-1 rounded">@userinfobot</code> to find yours.
            </p>
          </div>

          {/* Feedback message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2
              ${saveStatus === 'success' || testStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400' : ''}
              ${saveStatus === 'error'   || testStatus === 'error'   ? 'bg-red-500/10 text-red-400'         : ''}
              ${saveStatus === 'loading' || testStatus === 'loading' ? 'bg-blue-500/10 text-blue-400'       : ''}`}>
              <span>
                {(saveStatus === 'success' || testStatus === 'success') ? '✅' : ''}
                {(saveStatus === 'error'   || testStatus === 'error')   ? '❌' : ''}
                {(saveStatus === 'loading' || testStatus === 'loading') ? '⏳' : ''}
              </span>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isBusy}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition">
              {saveStatus === 'loading' ? 'Saving...' : '💾 Save Settings'}
            </button>
            <button type="button" onClick={handleTest} disabled={isBusy}
              className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 py-2.5 rounded-lg text-sm font-medium border border-gray-700 transition">
              {testStatus === 'loading' ? 'Sending...' : '🚀 Test Connection'}
            </button>
          </div>
        </form>
      </div>

      {/* How to get credentials */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">🔑 How to get your credentials</h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">1.</span>Open Telegram and search for <strong className="text-white">@BotFather</strong></li>
          <li className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">2.</span>Send <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">/newbot</code> and follow the instructions to get your <strong className="text-white">Bot Token</strong></li>
          <li className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">3.</span>For Chat ID: search <strong className="text-white">@userinfobot</strong> and send <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">/start</code></li>
          <li className="flex gap-3"><span className="text-blue-400 font-bold shrink-0">4.</span>For Group: add your bot to the group, then visit <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code></li>
        </ol>
      </div>
    </div>
  );
}
