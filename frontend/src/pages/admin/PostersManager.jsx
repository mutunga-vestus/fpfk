const BACKEND_URL = 'http://localhost:4000';
const BLANK_POSTER = { image: '', title: '' };

// Builds the add/edit poster form (form) and the existing-posters list
// (content) for the home page's poster slideshow, sharing ephemeral
// draft/editing state lifted from the parent (AdminDashboard). Mirrors
// buildMinistriesField, but simpler — just an image and an optional caption.
export function buildPostersField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK_POSTER;
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

  const startEdit = (i) => setUi({ editingIndex: i, draft: { ...items[i] }, error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_POSTER, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.image) {
      setUi({ error: 'Please upload a poster image first.' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_POSTER, editingIndex: null, error: '' });
  };

  const form = (
    <div className="border border-blue-200 bg-blue-50 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Poster' : 'Add New Poster'}
      </h3>

      <div>
        <label className="text-xs text-gray-500">Poster Image</label>
        {draft.image && (
          <img
            src={`${BACKEND_URL}${draft.image}`}
            alt="Preview"
            className="w-full max-w-xs max-h-64 object-contain bg-slate-900 rounded-xl border border-gray-200 my-2"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      </div>

      <div>
        <label className="text-xs text-gray-500">Caption (optional, e.g. "Year of Open Doors")</label>
        <input
          value={draft.title}
          onChange={(e) => updateDraftField('title', e.target.value)}
          placeholder="Year of Open Doors"
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
          {editingIndex !== null ? 'Save Changes' : '+ Add Poster'}
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
      <h3 className="font-semibold text-gray-800">Current Posters ({items.length})</h3>
      {items.map((poster, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center bg-gray-50">
          {poster.image && (
            <img
              src={`${BACKEND_URL}${poster.image}`}
              alt=""
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-slate-900"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{poster.title || 'Untitled poster'}</div>
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