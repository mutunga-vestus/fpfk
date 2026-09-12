const BACKEND_URL = 'http://localhost:4000';
const BLANK_MINISTRY = { image: '', title: '', desc: '', gallery: [] };

// Builds the add/edit ministry form (form) and the existing-ministries list
// (content) for the ministries field, sharing ephemeral draft/editing state
// lifted from the parent (AdminDashboard). Mirrors buildEventsField so
// ministries can have a photo, just like events — plus a gallery of photos
// and videos that shows up on that ministry's own page.
export function buildMinistriesField(items, onChange, ui, setUi, uploadMedia) {
  const draft = ui.draft || BLANK_MINISTRY;
  const uploading = ui.uploading || false;
  const galleryUploading = ui.galleryUploading || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const updateDraftField = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const { url } = await uploadMedia(file);
      setUi({ uploading: false, draft: { ...draft, image: url } });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same file later
    if (files.length === 0) return;
    setUi({ galleryUploading: true, error: '' });
    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadMedia(file));
      }
      const gallery = [...(draft.gallery || []), ...uploaded];
      setUi({ galleryUploading: false, draft: { ...draft, gallery } });
    } catch (err) {
      setUi({ galleryUploading: false, error: err.message });
    }
  };

  const removeGalleryItem = (i) => {
    const gallery = (draft.gallery || []).filter((_, idx) => idx !== i);
    setUi({ draft: { ...draft, gallery } });
  };

  const startEdit = (i) => setUi({ editingIndex: i, draft: { gallery: [], ...items[i] }, error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_MINISTRY, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      setUi({ error: 'Ministry title is required' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_MINISTRY, editingIndex: null, error: '' });
  };

  const galleryPreview = draft.gallery || [];

  const form = (
    <div className="border border-blue-200 bg-blue-50 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Ministry' : 'Add New Ministry'}
      </h3>

      <div>
        <label className="text-xs text-gray-500">Photo (optional, shown on the Ministries list)</label>
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

      <div>
        <label className="text-xs text-gray-500">Title</label>
        <input
          value={draft.title}
          onChange={(e) => updateDraftField('title', e.target.value)}
          placeholder="Children's Ministry"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
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

      <div className="pt-2 border-t border-blue-100">
        <label className="text-xs text-gray-500">
          Photos &amp; Videos (shown on this ministry's own page)
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleGalleryUpload}
          disabled={galleryUploading}
          className="block mt-1"
        />
        {galleryUploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}

        {galleryPreview.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
            {galleryPreview.map((g, i) => (
              <div key={i} className="relative group">
                {g.type === 'video' ? (
                  <video src={`${BACKEND_URL}${g.url}`} className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <img src={`${BACKEND_URL}${g.url}`} alt="" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                )}
                <button
                  type="button"
                  onClick={() => removeGalleryItem(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 rounded-full leading-none hover:bg-red-600"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Ministry'}
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
      <h3 className="font-semibold text-gray-800">Current Ministries ({items.length})</h3>
      {items.map((ministry, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center bg-gray-50">
          {ministry.image && (
            <img
              src={`${BACKEND_URL}${ministry.image}`}
              alt=""
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{ministry.title}</div>
            <div className="text-sm text-gray-500 truncate">{ministry.desc}</div>
            <div className="text-xs text-gray-400 mt-1">
              {(ministry.gallery || []).length} photo/video{(ministry.gallery || []).length === 1 ? '' : 's'}
            </div>
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