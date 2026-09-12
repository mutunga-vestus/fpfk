const BACKEND_URL = 'http://localhost:4000';
const BLANK_LEADER = { image: '', name: '', role: '', bio: '' };

export function buildLeadersField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK_LEADER;
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

  const startEdit = (i) =>
    setUi({ editingIndex: i, draft: { ...BLANK_LEADER, ...items[i] }, error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_LEADER, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.name.trim()) {
      setUi({ error: 'Name is required' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_LEADER, editingIndex: null, error: '' });
  };

  const form = (
    <div className="border border-indigo-200 bg-indigo-50 rounded-2xl p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Leader' : 'Add New Leader'}
      </h3>

      <div>
        <label className="text-xs text-gray-500">Photo</label>
        {draft.image && (
          <img
            src={`${BACKEND_URL}${draft.image}`}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-xl border border-gray-200 my-2"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      </div>

      <div>
        <label className="text-xs text-gray-500">Name</label>
        <input
          value={draft.name}
          onChange={(e) => updateDraftField('name', e.target.value)}
          placeholder="Pastor John Doe"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Role / Title</label>
        <input
          value={draft.role}
          onChange={(e) => updateDraftField('role', e.target.value)}
          placeholder="Senior Pastor"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Bio / Text below photo</label>
        <textarea
          value={draft.bio}
          onChange={(e) => updateDraftField('bio', e.target.value)}
          placeholder="Short introduction..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Leader'}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm text-gray-500 hover:underline self-start sm:self-center"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  const content =
    items.length > 0 ? (
      <div className="space-y-3">
        {items.map((l, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-3 sm:p-4 flex gap-4 items-center bg-gray-50"
          >
            {l.image ? (
              <img
                src={`${BACKEND_URL}${l.image}`}
                alt=""
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {(l.name || '?').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{l.name || '(unnamed)'}</div>
              {l.role && <div className="text-xs text-indigo-600">{l.role}</div>}
              {l.bio && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">{l.bio}</div>
              )}
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => startEdit(i)}
                className="text-sm text-indigo-600 hover:underline"
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