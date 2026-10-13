import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = '/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const expired = new URLSearchParams(window.location.search).get('expired') === '1';
  const [error, setError] = useState(expired ? 'Your session expired — please log in again.' : '');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { token, email: userEmail } = await res.json();
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_email', userEmail);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="text-3xl font-bold mb-8 text-center text-brand-fg">Admin Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-brand-fg placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-deep">
          Log In
        </button>
      </form>
      <div className="flex justify-between mt-6 text-sm">
        <Link to="/admin/register" className="text-brand hover:underline">
          Create an account
        </Link>
        <Link to="/admin/forgot-password" className="text-brand hover:underline">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}