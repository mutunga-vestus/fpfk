import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/api';

export default function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, registrationCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message || 'Check your email to verify your account.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-brand-fg">Create Admin Account</h1>

      {message ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            required
          />
          <input
            type="password"
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            required
          />
          <input
            type="password"
            placeholder="Registration code"
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
            required
          />
          <p className="text-xs text-brand-muted">
            Ask whoever manages the church website for the registration code.
          </p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            disabled={submitting}
            className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-deep disabled:opacity-50"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
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