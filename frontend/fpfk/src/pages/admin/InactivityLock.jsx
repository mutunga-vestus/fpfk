import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';
const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export default function InactivityLock({ children }) {
  const [locked, setLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const lastActivity = useRef(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    const markActive = () => { lastActivity.current = Date.now(); };
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, markActive));

    const interval = setInterval(() => {
      if (!locked && Date.now() - lastActivity.current > IDLE_LIMIT_MS) {
        setLocked(true);
      }
    }, 5000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActive));
      clearInterval(interval);
    };
  }, [locked]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');
    setChecking(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Incorrect password');

      setLocked(false);
      setPassword('');
      lastActivity.current = Date.now();
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  if (!locked) return children;

  const email = localStorage.getItem('admin_email');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">Session Locked</h2>
        <p className="text-sm text-gray-500 mb-6">
          You've been inactive for a while{email ? ` — ${email}` : ''}. Enter your password to continue.
        </p>
        <form onSubmit={handleUnlock} className="space-y-4">
          <input
            type="password"
            autoFocus
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            disabled={checking}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Unlock'}
          </button>
        </form>
        <button
          onClick={handleLogout}
          className="w-full text-sm text-gray-500 hover:underline mt-4"
        >
          Log out instead
        </button>
      </div>
    </div>
  );
}