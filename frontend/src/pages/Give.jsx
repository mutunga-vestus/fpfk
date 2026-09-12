import { useState } from 'react';
import { Copy, Check, Smartphone, Landmark } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const API_URL = 'http://localhost:4000/api';

const BLANK_FORM = {
  fullName: '',
  email: '',
  phone: '',
  amount: '',
  reference: '',
};

function CopyableRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore, value is still visible to copy manually.
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="font-semibold text-slate-800">{value || '—'}</div>
      </div>
      {value && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-slate-400 hover:text-indigo-600 transition p-2"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// Normalizes Kenyan phone numbers to the 2547XXXXXXXX / 2541XXXXXXXX format Daraja expects.
function normalizeMsisdn(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 9) return `254${digits}`;
  if (digits.startsWith('1') && digits.length === 9) return `254${digits}`;
  return null;
}

export default function Give() {
  const { content, loading } = useContent();
  const [givingType, setGivingType] = useState('');
  const [method, setMethod] = useState('mpesa'); // 'mpesa' | 'bank'
  const [form, setForm] = useState(BLANK_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  // STK Push state (M-Pesa "Pay Now") — separate from the manual notify-us form above.
  const [mpesaMode, setMpesaMode] = useState('stk'); // 'stk' | 'manual'
  const [stkPhone, setStkPhone] = useState('');
  const [stkAmount, setStkAmount] = useState('');
  const [stkStatus, setStkStatus] = useState('idle'); // idle | requesting | pending | success | failed | timeout
  const [stkError, setStkError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  if (loading) return null;
  const {
    title, subtitle, note,
    givingTypes = [], mpesaPaybill, mpesaAccountNumber,
    bankName, bankAccountName, bankAccountNumber, bankBranch, bankSwift,
  } = content.give;

  const effectiveGivingType = givingType || givingTypes[0]?.label || '';
  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const pollStkStatus = async (id, attemptsLeft = 20) => {
    if (attemptsLeft <= 0) {
      setStkStatus('timeout');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/mpesa/stkpush/status/${id}`);
      const data = await res.json();
      if (data.status === 'success') {
        setStkStatus('success');
        return;
      }
      if (data.status === 'failed' || data.status === 'cancelled') {
        setStkStatus('failed');
        setStkError(data.message || 'The payment was not completed.');
        return;
      }
      // still pending — poll again in 3s
      setTimeout(() => pollStkStatus(id, attemptsLeft - 1), 3000);
    } catch {
      setTimeout(() => pollStkStatus(id, attemptsLeft - 1), 3000);
    }
  };

  const handleStkPush = async (e) => {
    e.preventDefault();
    setStkError('');

    const msisdn = normalizeMsisdn(stkPhone);
    if (!msisdn) {
      setStkError('Enter a valid Safaricom number, e.g. 07XXXXXXXX.');
      return;
    }
    const amountNum = Number(stkAmount);
    if (!amountNum || amountNum <= 0) {
      setStkError('Enter an amount greater than 0.');
      return;
    }

    setStkStatus('requesting');
    try {
      const res = await fetch(`${API_URL}/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: msisdn,
          amount: Math.round(amountNum),
          accountReference: mpesaAccountNumber || 'Giving',
          description: effectiveGivingType || 'Giving',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start the payment prompt.');

      setCheckoutRequestId(data.checkoutRequestId);
      setStkStatus('pending');
      pollStkStatus(data.checkoutRequestId);
    } catch (err) {
      setStkStatus('failed');
      setStkError(err.message);
    }
  };

  const resetStk = () => {
    setStkStatus('idle');
    setStkError('');
    setCheckoutRequestId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveGivingType) {
      setError('Please select what you are giving.');
      return;
    }
    if (!form.email && !form.phone) {
      setError('Please provide your email or phone number so we can follow up.');
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/giving`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          amount: form.amount,
          reference: form.reference,
          givingType: effectiveGivingType,
          paymentMethod: method === 'mpesa' ? 'M-Pesa Paybill' : 'Bank Transfer',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record your gift');
      setStatus('success');
      setForm(BLANK_FORM);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const inputBase =
    'block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 outline-none transition-all';

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{title}</h1>
          <p className="text-lg text-slate-500">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5">
            <h2 className="text-white font-bold text-lg tracking-tight">Make a Gift</h2>
            <p className="text-indigo-200 text-xs mt-1">Choose how you'd like to give and let us know once it's done.</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Step 1 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. What would you like to give?
              </label>
              <select
                value={effectiveGivingType}
                onChange={(e) => setGivingType(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 outline-none transition-all appearance-none cursor-pointer"
              >
                {givingTypes.map((t) => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Step 2 */}
                        
            <div className="space-y-2 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                2. How would you like to pay?
              </label>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setMethod('mpesa')}
                  className={`flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 transition-all ${
                    method === 'mpesa' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className={`w-5 h-5 ${method === 'mpesa' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">Pay Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 transition-all ${
                    method === 'bank' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Landmark className={`w-5 h-5 ${method === 'bank' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">Bank Transfer</span>
                </button>
              </div>

              {method === 'mpesa' ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  {stkStatus === 'success' ? (
                    <div className="text-center py-4">
                      <p className="text-emerald-700 font-semibold">Payment received — thank you!</p>
                      <p className="text-xs text-slate-500 mt-1">A confirmation has been recorded automatically.</p>
                    </div>
                  ) : stkStatus === 'pending' || stkStatus === 'requesting' ? (
                    <div className="text-center py-4">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-700">Check your phone</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Enter your M-Pesa PIN on the prompt sent to <span className="font-semibold">{stkPhone}</span> — never here on this page.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                          <input
                            type="tel"
                            placeholder="07XX XXX XXX"
                            value={stkPhone}
                            onChange={(e) => setStkPhone(e.target.value)}
                            className={inputBase}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-500 font-bold text-sm pointer-events-none">KSh</span>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="0"
                              value={stkAmount}
                              onChange={(e) => setStkAmount(e.target.value)}
                              className="block w-full pl-14 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {(stkStatus === 'failed' || stkStatus === 'timeout') && (
                        <p className="text-red-600 text-center bg-red-50 border border-red-200 rounded-xl py-2 text-xs">
                          {stkStatus === 'timeout'
                            ? "We didn't get a confirmation in time. If you completed the payment, it may still go through — check your M-Pesa messages."
                            : stkError}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleStkPush}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                      >
                        Send Payment Prompt
                      </button>
                      <p className="text-xs text-slate-400 text-center">
                        You'll get a prompt on your phone from Safaricom. Enter your M-Pesa PIN there — we never ask for it here.
                      </p>
                    </div>
                  )}

                  {(stkStatus === 'failed' || stkStatus === 'timeout' || stkStatus === 'success') && (
                    <button
                      type="button"
                      onClick={resetStk}
                      className="mt-3 text-xs font-semibold text-indigo-600 hover:underline block mx-auto"
                    >
                      {stkStatus === 'success' ? 'Make another gift' : 'Try again'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl px-5 py-1 border border-slate-200">
                  <CopyableRow label="Bank Name" value={bankName} />
                  <CopyableRow label="Account Name" value={bankAccountName} />
                  <CopyableRow label="Account Number" value={bankAccountNumber} />
                  <CopyableRow label="Branch" value={bankBranch} />
                  {bankSwift && <CopyableRow label="SWIFT/Code" value={bankSwift} />}
                </div>
              )}
            </div>
          </div>
        </div>

        {note && <p className="mt-8 text-center text-sm text-slate-500">{note}</p>}
      </div>
    </div>
  );
}
