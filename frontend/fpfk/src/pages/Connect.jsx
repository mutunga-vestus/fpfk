import { useState } from 'react';
import { User, Mail, Phone, Globe2, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { COUNTRIES } from '../data/countries';

const API_URL = 'http://localhost:4000/api';

const BLANK_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationality: '',
  reason: '',
  message: '',
};

const REASONS = [
  { value: '', label: 'Select a reason...' },
  { value: 'first-time', label: "I'm new here" },
  { value: 'prayer', label: 'Prayer Request' },
  { value: 'membership', label: 'Membership Info' },
  { value: 'volunteer', label: 'Volunteering' },
  { value: 'general', label: 'General Inquiry' },
];

const MESSAGE_MAX = 600;

function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-red-600 text-xs mt-1.5 ml-1">{children}</p>;
}

export default function Connect() {
  const { content, loading } = useContent();
  const [form, setForm] = useState(BLANK_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  if (loading) return null;
  const { title, subtitle } = content.connect;

  const updateField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((fe) => ({ ...fe, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Please enter your first name.';
    if (!form.email.trim()) {
      errs.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!form.nationality.trim()) errs.nationality = 'Please enter your nationality.';
    if (!form.message.trim()) errs.message = 'Please let us know how we can help.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Please fix the highlighted fields below.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setStatus('success');
      setForm(BLANK_FORM);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const inputBase =
    'block w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 outline-none transition-all';
  const borderFor = (key) => (fieldErrors[key] ? 'border-red-400' : 'border-slate-200');

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{title}</h1>
          <p className="text-lg text-slate-500">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5">
            <h2 className="text-white font-bold text-lg tracking-tight">Get In Touch</h2>
            <p className="text-indigo-200 text-xs mt-1">Fill in your details and we'll get back to you.</p>
          </div>

          <div className="p-6 md:p-8">
            {status === 'success' ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-slate-800 mb-2">Message sent!</p>
                <p className="text-slate-500 mb-8">
                  Thank you for reaching out — we'll be in touch soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-indigo-600 font-bold text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Name */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        className={`${inputBase} ${borderFor('firstName')}`}
                      />
                    </div>
                    <FieldError>{fieldErrors.firstName}</FieldError>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        className={`${inputBase} ${borderFor('lastName')}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Email + Phone */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={`${inputBase} ${borderFor('email')}`}
                      />
                    </div>
                    <FieldError>{fieldErrors.email}</FieldError>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="Optional"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={`${inputBase} ${borderFor('phone')}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Nationality + Reason */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Nationality</label>
                    <div className="relative">
                      <Globe2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        list="nationality-options"
                        value={form.nationality}
                        onChange={(e) => updateField('nationality', e.target.value)}
                        className={`${inputBase} ${borderFor('nationality')}`}
                      />
                      <datalist id="nationality-options">
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    <FieldError>{fieldErrors.nationality}</FieldError>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Reason</label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={form.reason}
                        onChange={(e) => updateField('reason', e.target.value)}
                        className={`${inputBase} ${borderFor('reason')} appearance-none cursor-pointer`}
                      >
                        {REASONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">How Can We Pray For You?</label>
                  <textarea
                    rows={5}
                    maxLength={MESSAGE_MAX}
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    className={`block w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 outline-none transition-all resize-none ${borderFor(
                      'message'
                    )}`}
                  ></textarea>
                  <div className="flex justify-between items-start">
                    <FieldError>{fieldErrors.message}</FieldError>
                    <span className="text-xs text-slate-400 ml-auto">
                      {form.message.length}/{MESSAGE_MAX}
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-center bg-red-50 border border-red-200 rounded-xl py-3 text-sm">
                    {error}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex items-center justify-center gap-2 px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}