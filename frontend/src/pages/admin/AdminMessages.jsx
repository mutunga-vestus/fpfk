import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load messages');
      setMessages(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/messages/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!messages) return <div className="text-gray-500">Loading messages...</div>;

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Messages ({messages.length}){unreadCount > 0 && (
          <span className="ml-2 text-base font-medium text-blue-600">{unreadCount} new</span>
        )}
      </h1>

      {messages.length === 0 && (
        <p className="text-gray-500">No messages yet — submissions from the Connect page will show up here.</p>
      )}

      {messages.map((m) => (
        <div
          key={m.id}
          className={`border rounded-xl p-5 ${
            m.is_read ? 'border-gray-200 bg-white' : 'border-blue-300 bg-blue-50'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-semibold">
                {m.first_name || m.last_name ? `${m.first_name} ${m.last_name}`.trim() : 'Anonymous'}
                {!m.is_read && (
                  <span className="ml-2 text-xs text-blue-600 font-medium align-middle">NEW</span>
                )}
              </div>
              <div className="text-sm text-gray-500">{m.email}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(m.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              {!m.is_read && (
                <button
                  onClick={() => markAsRead(m.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => deleteMessage(m.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
    </div>
  );
}