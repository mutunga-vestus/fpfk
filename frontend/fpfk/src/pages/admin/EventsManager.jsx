const BACKEND_URL = 'http://localhost:4000';
const BLANK_EVENT = { image: '', date: '', title: '', desc: '', buttonLabel: 'Register' };

// Builds the add/edit event form (form) and the existing-events list
// (content) for the events field, sharing ephemeral draft/editing state
// lifted from the parent (AdminDashboard).
export function buildEventsField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK_EVENT;
  const uploading = ui.uploading || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const updateDraftField = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const url = await uploadImage(file);
      setUi({ uploading: false, draft: { ...draft, image: url } });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
  };

  const startEdit = (i) => setUi({ editingIndex: i, draft: items[i], error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_EVENT, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      setUi({ error: 'Event title is required' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_EVENT, editingIndex: null, error: '' });
  };

  const form = (
    <div className="border border-blue-200 bg-blue-50 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Event' : 'Add New Event'}
      </h3>

      <div>
        <label className="text-xs text-gray-500">Flyer / Photo (optional)</label>
        {draft.image && (
          <img
            src={`${BACKEND_URL}${draft.image}`}
            alt="Preview"
            className="w-full max-w-xs h-40 object-cover rounded-xl border border-gray-200 my-2"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Date/Time</label>
          <input
            value={draft.date}
            onChange={(e) => updateDraftField('date', e.target.value)}
            placeholder="JULY 25 • 6:00 PM"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Event Title</label>
          <input
            value={draft.title}
            onChange={(e) => updateDraftField('title', e.target.value)}
            placeholder="Summer Family Picnic"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">Description</label>
        <textarea
          value={draft.desc}
          onChange={(e) => updateDraftField('desc', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Button Text</label>
        <input
          value={draft.buttonLabel}
          onChange={(e) => updateDraftField('buttonLabel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Event'}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm text-gray-500 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  const content = items.length > 0 ? (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Current Events ({items.length})</h3>
      {items.map((event, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center bg-gray-50">
          {event.image && (
            <img
              src={`${BACKEND_URL}${event.image}`}
              alt=""
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-blue-600 font-medium">{event.date}</div>
            <div className="font-semibold truncate">{event.title}</div>
            <div className="text-sm text-gray-500 truncate">{event.desc}</div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => startEdit(i)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(i)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  return { form, content };
}