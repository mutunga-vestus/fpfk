import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/api';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'If that email exists, a reset link has been sent.');
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-brand-fg">Forgot Password</h1>

      {message ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            required
          />
          <button
            disabled={submitting}
            className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-deep disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <div className="text-center mt-6 text-sm">
        <Link to="/admin/login" className="text-brand hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}