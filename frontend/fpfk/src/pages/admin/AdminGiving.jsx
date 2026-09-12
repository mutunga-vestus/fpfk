import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === '') return '—';
  return `KSh ${Number(amount).toLocaleString()}`;
}

const BLANK_SETTINGS = {
  title: '',
  subtitle: '',
  note: '',
  mpesaPaybill: '',
  mpesaAccountNumber: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankBranch: '',
  bankSwift: '',
};

// --- Editable settings panel for the public Give page (Paybill, bank details, etc.) ---
function GivingSettingsPanel() {
  const [settings, setSettings] = useState(null); // null while loading
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [error, setError] = useState('');

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/content`);
      if (!res.ok) throw new Error('Failed to load giving page settings');
      const data = await res.json();
      const give = data.give || {};
      setSettings({
        ...BLANK_SETTINGS,
        ...give,
        // givingTypes is preserved as-is and re-sent untouched on save
        givingTypes: give.givingTypes || [],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateField = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveState('saving');
    setError('');
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/content/give`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setSaveState('error');
      setError(err.message);
    }
  };

  const inputBase =
    'block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none';
  const labelBase = 'block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1';

  if (error && !settings) {
    return <p className="text-red-600">{error}</p>;
  }
  if (!settings) {
    return <div className="text-gray-500">Loading giving page settings...</div>;
  }

  return (
    <form
      onSubmit={handleSave}
      className="border border-gray-200 rounded-xl p-6 bg-gray-50 space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-900">Giving Page Settings</h2>
        <div className="flex items-center gap-3">
          {saveState === 'saved' && (
            <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>
          )}
          {saveState === 'error' && (
            <span className="text-sm text-red-600 font-medium">{error}</span>
          )}
          <button
            type="submit"
            disabled={saveState === 'saving'}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg disabled:opacity-50"
          >
            {saveState === 'saving' ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Page Text</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => updateField('title', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Subtitle</label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelBase}>Footer Note</label>
          <input
            type="text"
            value={settings.note}
            onChange={(e) => updateField('note', e.target.value)}
            className={inputBase}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-3">M-Pesa Paybill (manual)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Paybill Number</label>
            <input
              type="text"
              value={settings.mpesaPaybill}
              onChange={(e) => updateField('mpesaPaybill', e.target.value)}
              className={inputBase}
              placeholder="e.g. 400222"
            />
          </div>
          <div>
            <label className={labelBase}>Account Number</label>
            <input
              type="text"
              value={settings.mpesaAccountNumber}
              onChange={(e) => updateField('mpesaAccountNumber', e.target.value)}
              className={inputBase}
              placeholder="e.g. 872717"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Bank Transfer</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Bank Name</label>
            <input
              type="text"
              value={settings.bankName}
              onChange={(e) => updateField('bankName', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Account Name</label>
            <input
              type="text"
              value={settings.bankAccountName}
              onChange={(e) => updateField('bankAccountName', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Account Number</label>
            <input
              type="text"
              value={settings.bankAccountNumber}
              onChange={(e) => updateField('bankAccountNumber', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>Branch</label>
            <input
              type="text"
              value={settings.bankBranch}
              onChange={(e) => updateField('bankBranch', e.target.value)}
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>SWIFT / Code</label>
            <input
              type="text"
              value={settings.bankSwift}
              onChange={(e) => updateField('bankSwift', e.target.value)}
              className={inputBase}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default function AdminGiving() {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');

  const loadRecords = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/giving`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load giving records');
      setRecords(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const markConfirmed = async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/giving/${id}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, is_confirmed: true } : r)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this giving record? This cannot be undone.')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/giving/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <GivingSettingsPanel />

      <div className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        {!records ? (
          <div className="text-gray-500">Loading giving records...</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              Giving Records ({records.length})
              {records.filter((r) => !r.is_confirmed).length > 0 && (
                <span className="ml-2 text-base font-medium text-blue-600">
                  {records.filter((r) => !r.is_confirmed).length} to confirm
                </span>
              )}
            </h1>

            {records.length === 0 && (
              <p className="text-gray-500">
                No giving notifications yet — submissions from the Give page will show up here.
              </p>
            )}

            {records.map((r) => (
              <div
                key={r.id}
                className={`border rounded-xl p-5 ${
                  r.is_confirmed ? 'border-gray-200 bg-white' : 'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold">
                      {r.full_name || 'Anonymous'}
                      {!r.is_confirmed && (
                        <span className="ml-2 text-xs text-blue-600 font-medium align-middle">NEW</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {[r.email, r.phone].filter(Boolean).join(' • ') || 'No contact provided'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    {!r.is_confirmed && (
                      <button
                        onClick={() => markConfirmed(r.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Mark confirmed
                      </button>
                    )}
                    <button
                      onClick={() => deleteRecord(r.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Type: </span>
                    <span className="text-gray-700 font-medium">{r.giving_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Method: </span>
                    <span className="text-gray-700 font-medium">{r.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount: </span>
                    <span className="text-gray-700 font-medium">{formatAmount(r.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Reference: </span>
                    <span className="text-gray-700 font-medium">{r.reference || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
