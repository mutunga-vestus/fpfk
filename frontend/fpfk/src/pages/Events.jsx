import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const BACKEND_URL = 'http://localhost:4000';
const API_URL = 'http://localhost:4000/api';

const BLANK_FORM = { fullName: '', nationality: '', phone: '' };

function RegisterModal({ event, onClose }) {
  const [form, setForm] = useState(BLANK_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError('Please provide your full name and phone number.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/events/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id || event.title,
          eventTitle: event.title,
          fullName: form.fullName,
          nationality: form.nationality,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const inputBase =
    'block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 outline-none transition-all';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'success' ? (
          <div className="p-8 text-center py-10">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">You're registered!</h3>
            <p className="text-slate-500 text-sm">We look forward to seeing you at {event.title}.</p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg tracking-tight">Register</h2>
                <p className="text-indigo-200 text-xs mt-1">{event.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-indigo-200 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={inputBase}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nationality</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="e.g. Kenyan"
                    className={inputBase}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="07XXXXXXXX"
                    className={inputBase}
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm">
                    {error}
                  </p>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {status === 'sending' ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const { content, loading } = useContent();
  const [registeringEvent, setRegisteringEvent] = useState(null);

  if (loading) return null;
  const { title, subtitle, items } = content.events;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-center mb-6">{title}</h1>
      <p className="text-center text-slate-600 mb-12">{subtitle}</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((event, i) => (
          <div
            key={event.id || i}
            className="border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-xl flex flex-col"
          >
            {event.image && (
              <img
                src={`${BACKEND_URL}${event.image}`}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-8 flex flex-col flex-1">
              <div className="text-indigo-600 font-medium">{event.date}</div>
              <h3 className="text-2l font-semibold mt-2 mb-3">{event.title}</h3>
              <p className="text-slate-600 mb-6">{event.desc}</p>
              <button
                onClick={() => setRegisteringEvent(event)}
                className="mt-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3.5 rounded-full self-start shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5"
              >
                {event.buttonLabel}
              </button>
            </div>
          </div>
        ))}
      </div>

      {registeringEvent && (
        <RegisterModal event={registeringEvent} onClose={() => setRegisteringEvent(null)} />
      )}
    </div>
  );
}