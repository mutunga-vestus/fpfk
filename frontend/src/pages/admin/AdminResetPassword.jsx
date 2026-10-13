import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = '/api';

export default function AdminResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token — use the link from your email.');
      return;
    }
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
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold mb-6 text-brand-fg">Password Updated</h1>
        <p className="text-brand-fg mb-6">You can now log in with your new password.</p>
        <button
          onClick={() => navigate('/admin/login')}
          className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-deep"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-brand-fg">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-deep disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Set New Password'}
        </button>
      </form>
      <div className="text-center mt-6 text-sm">
        <Link to="/admin/login" className="text-brand hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}