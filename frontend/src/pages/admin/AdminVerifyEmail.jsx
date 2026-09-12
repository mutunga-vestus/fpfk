import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:4000/api';

export default function AdminVerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    fetch(`${API_URL}/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStatus('success');
        setMessage(data.message || 'Email verified — you can now log in.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, []);

  return (
    <div className="max-w-sm mx-auto px-6 py-24 text-center">
      <h1 className="text-3xl font-bold mb-6">Email Verification</h1>
      <p className={status === 'error' ? 'text-red-600' : 'text-gray-700'}>{message}</p>
      {status === 'success' && (
        <Link to="/admin/login" className="inline-block mt-6 text-blue-600 hover:underline">
          Go to login
        </Link>
      )}
    </div>
  );
}