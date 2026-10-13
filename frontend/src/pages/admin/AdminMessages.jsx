import { useEffect, useState, Fragment } from 'react';

const API_URL = '/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

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

  if (error) return <p className="text-red-400">{error}</p>;
  if (!messages) return <div className="text-brand-muted">Loading messages…</div>;

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <h1 className="text-lg font-semibold text-brand-fg tracking-tight">Messages</h1>
        <span className="text-sm text-brand-muted">{messages.length} total</span>
        {unreadCount > 0 && (
          <span className="text-xs font-semibold bg-brand/20 text-brand px-2 py-0.5 rounded-full">{unreadCount} new</span>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="text-brand-muted text-sm">No messages yet — Connect page submissions appear here.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="bg-[#141414]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">From</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Email</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Preview</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => {
                const name =
                  m.first_name || m.last_name
                    ? `${m.first_name || ''} ${m.last_name || ''}`.trim()
                    : 'Anonymous';
                const isOpen = expanded === m.id;
                return (
                  <Fragment key={m.id}>
                    <tr className={`hover:bg-white/[0.02] ${!m.is_read ? 'bg-brand/5' : ''}`}>
                      <td className="px-4 py-3 border-b border-brand-border/70">
                        {!m.is_read ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-brand bg-brand/15 px-1.5 py-0.5 rounded">New</span>
                        ) : (
                          <span className="text-[10px] text-brand-muted">Read</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg font-medium whitespace-nowrap">{name}</td>
                      <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted">{m.email || '—'}</td>
                      <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted max-w-[220px] truncate">
                        <button type="button" onClick={() => setExpanded(isOpen ? null : m.id)} className="hover:text-brand-fg text-left truncate max-w-full">
                          {m.message || '—'}
                        </button>
                      </td>
                      <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted whitespace-nowrap text-xs">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border-b border-brand-border/70 text-right whitespace-nowrap">
                        {!m.is_read && (
                          <button type="button" onClick={() => markAsRead(m.id)} className="text-brand hover:text-brand-soft text-sm font-medium mr-3">
                            Mark read
                          </button>
                        )}
                        <button type="button" onClick={() => deleteMessage(m.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 border-b border-brand-border bg-[#121212] text-brand-fg whitespace-pre-wrap text-sm">
                          {m.message}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
