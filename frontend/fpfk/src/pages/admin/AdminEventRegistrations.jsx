import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:4000/api';

export default function AdminEventRegistrations() {
  const [registrations, setRegistrations] = useState(null);
  const [error, setError] = useState('');
  const [expandedEvent, setExpandedEvent] = useState(null);

  const loadRegistrations = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`${API_URL}/events/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load event registrations');
      setRegistrations(await res.json());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const deleteRegistration = async (id) => {
    if (!window.confirm('Remove this registration?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(`${API_URL}/events/registrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Group registrations by event so admins can see attendee lists per event.
  const groups = useMemo(() => {
    if (!registrations) return [];
    const map = new Map();
    for (const r of registrations) {
      const key = r.event_id || r.event_title;
      if (!map.has(key)) map.set(key, { eventTitle: r.event_title, registrations: [] });
      map.get(key).registrations.push(r);
    }
    return Array.from(map.values()).sort((a, b) => b.registrations.length - a.registrations.length);
  }, [registrations]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!registrations) return <div className="text-gray-500">Loading registrations...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Event Registrations ({registrations.length})</h1>

      {groups.length === 0 && (
        <p className="text-gray-500">
          No one has registered for an event yet — signups will show up here, grouped by event.
        </p>
      )}

      {groups.map((group) => {
        const key = group.registrations[0]?.event_id || group.eventTitle;
        const isOpen = expandedEvent === key;
        return (
          <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedEvent(isOpen ? null : key)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="font-semibold">{group.eventTitle}</span>
              <span className="text-sm text-gray-500">{group.registrations.length} registered</span>
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-100">
                {group.registrations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-4 px-5 py-3 flex-wrap">
                    <div>
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-sm text-gray-500">
                        {[r.nationality, r.phone].filter(Boolean).join(' • ') || 'No further details'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => deleteRegistration(r.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}