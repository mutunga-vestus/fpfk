import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const BACKEND_URL = '';
const API_URL = '/api';

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
    'block w-full px-4 py-2.5 bg-brand-dark border border-brand-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand text-sm text-brand-fg outline-none transition-all placeholder:text-brand-muted';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-brand-border rounded-2xl border border-brand-border shadow-sm overflow-hidden w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'success' ? (
          <div className="p-8 text-center py-10">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-fg mb-2">You're registered!</h3>
            <p className="text-brand-muted text-sm">We look forward to seeing you at {event.title}.</p>
            <button
              onClick={onClose}
              className="mt-6 px-8 py-2.5 bg-gradient-to-r from-brand to-brand-red hover:from-brand-deep hover:to-brand-red-dark text-white text-xs font-bold rounded-xl shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-brand to-brand-red px-8 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg tracking-tight">Register</h2>
                <p className="text-brand-soft text-xs mt-1">{event.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-brand-soft hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-fg uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className={inputBase}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-fg uppercase tracking-wider">Nationality</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="e.g. Kenyan"
                    className={inputBase}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-fg uppercase tracking-wider">Phone Number</label>
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
                  <p className="text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-2.5 text-sm">
                    {error}
                  </p>
                )}

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-bold text-brand-muted hover:text-brand-fg border border-brand-border rounded-xl hover:bg-brand-dark transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-8 py-2.5 bg-gradient-to-r from-brand to-brand-red hover:from-brand-deep hover:to-brand-red-dark text-white text-xs font-bold rounded-xl shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
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
      <h1 className="text-5xl font-bold text-center mb-6 text-brand-fg">{title}</h1>
      <p className="text-center text-brand-muted mb-12">{subtitle}</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((event, i) => (
          <div
            key={event.id || i}
            className="border border-brand-border rounded-3xl overflow-hidden hover:border-brand/30 transition-all hover:shadow-xl flex flex-col"
          >
            {event.image && (
              <button
                type="button"
                onClick={() => {
              window.location.href = `${BACKEND_URL}${event.image}`;
              }}
                className="block w-full focus:outline-none group"
              >
                <img
                  src={`${BACKEND_URL}${event.image}`}
                  alt={event.title}
                  className="w-full h-48 object-cover cursor-pointer transition group-hover:opacity-90"
                />
              </button>
            )}
            <div className="p-8 flex flex-col flex-1">
              <div className="text-brand font-medium">{event.date}</div>
              <h3 className="text-2xl font-semibold mt-2 mb-3 text-brand-fg">{event.title}</h3>
              <p className="text-brand-muted mb-6">{event.desc}</p>
              <button
                onClick={() => setRegisteringEvent(event)}
                className="mt-auto bg-gradient-to-r from-brand to-brand-red hover:from-brand-deep hover:to-brand-red-dark text-white px-8 py-3.5 rounded-full self-start shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5"
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