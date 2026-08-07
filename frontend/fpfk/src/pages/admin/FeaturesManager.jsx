const BACKEND_URL = 'http://localhost:4000';
const BLANK_FEATURE = { image: '', title: '' };

// Builds the add/edit form and existing-cards list for the homepage "feature
// cards" section (the row below the poster slideshow). Just a photo (optional
// — cards work as plain text too) and a title; every card links through to
// the Ministries page.
export function buildFeaturesField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK_FEATURE;
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

  const startEdit = (i) => setUi({ editingIndex: i, draft: { ...BLANK_FEATURE, ...items[i] }, error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_FEATURE, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      setUi({ error: 'Card title is required' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_FEATURE, editingIndex: null, error: '' });
  };

  const form = (
    <div className="border border-indigo-200 bg-indigo-50 rounded-2xl p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Feature Card' : 'Add New Feature Card'}
      </h3>

      <div>
        <label className="text-xs text-gray-500">Photo (optional — shows instead of the default icon)</label>
        {draft.image && (
          <img
            src={`${BACKEND_URL}${draft.image}`}
            alt="Preview"
            className="w-full max-w-xs h-32 object-cover rounded-xl border border-gray-200 my-2"
          />
        )}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
      </div>

      <div>
        <label className="text-xs text-gray-500">Title</label>
        <input
          value={draft.title}
          onChange={(e) => updateDraftField('title', e.target.value)}
          placeholder="Sunday Services"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Feature Card'}
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

  const content = items.length > 0 ? (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 sm:p-4 flex gap-4 items-center bg-gray-50">
          {f.image ? (
            <img
              src={`${BACKEND_URL}${f.image}`}
              alt=""
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-indigo-100 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{f.title || '(untitled)'}</div>
            {!f.image && <div className="text-xs text-gray-400 mt-1">Text only — no photo uploaded</div>}
          </div>
          <div className="flex gap-3 shrink-0">
            <button type="button" onClick={() => startEdit(i)} className="text-sm text-indigo-600 hover:underline">
              Edit
            </button>
            <button type="button" onClick={() => handleDelete(i)} className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  ) : null;

  return { form, content };
}