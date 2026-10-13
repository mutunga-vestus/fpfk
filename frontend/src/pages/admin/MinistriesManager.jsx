const BACKEND_URL = '';
const BLANK_MINISTRY = { image: '', title: '', desc: '', gallery: [] };
const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input = 'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

export function buildMinistriesField(items, onChange, ui, setUi, uploadMedia) {
  const draft = ui.draft || BLANK_MINISTRY;
  const uploading = ui.uploading || false;
  const galleryUploading = ui.galleryUploading || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const updateDraftField = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const result = await uploadMedia(file);
      const url = result?.url ?? result;
      setUi({ uploading: false, draft: { ...draft, image: url } });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
    e.target.value = '';
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUi({ galleryUploading: true, error: '' });
    try {
      const uploaded = [];
      for (const file of files) uploaded.push(await uploadMedia(file));
      setUi({ galleryUploading: false, draft: { ...draft, gallery: [...(draft.gallery || []), ...uploaded] } });
    } catch (err) {
      setUi({ galleryUploading: false, error: err.message });
    }
  };

  const removeGalleryItem = (i) => {
    setUi({ draft: { ...draft, gallery: (draft.gallery || []).filter((_, idx) => idx !== i) } });
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
    if (editingIndex !== null) onChange(items.map((item, idx) => (idx === editingIndex ? draft : item)));
    else onChange([...items, draft]);
    setUi({ draft: BLANK_MINISTRY, editingIndex: null, error: '' });
  };

  const galleryPreview = draft.gallery || [];

  const form = (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <h3 className="text-sm font-semibold text-brand-fg border-b border-brand-border pb-3">
        {editingIndex !== null ? 'Edit ministry' : 'Add ministry'}
      </h3>

      <div>
        <label className={label}>Cover photo</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {draft.image ? (
            <div className="relative shrink-0">
              <img src={`${BACKEND_URL}${draft.image}`} alt="" className="w-36 h-24 object-cover rounded-lg border border-brand-border" />
              <button type="button" onClick={() => updateDraftField('image', '')} className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded">Remove</button>
            </div>
          ) : null}
          <label className="flex flex-col items-center justify-center flex-1 min-h-[96px] border border-dashed border-brand-border rounded-lg bg-[#121212] hover:border-brand/50 cursor-pointer px-3 py-4 transition">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
            <span className="text-sm text-brand-fg">{uploading ? 'Uploading…' : 'Upload cover'}</span>
          </label>
        </div>
      </div>

      <div>
        <label className={label}>Title <span className="text-red-400">*</span></label>
        <input value={draft.title} onChange={(e) => updateDraftField('title', e.target.value)} placeholder="Children's Ministry" className={input} />
      </div>
      <div>
        <label className={label}>Description</label>
        <textarea value={draft.desc} onChange={(e) => updateDraftField('desc', e.target.value)} rows={3} placeholder="Short description…" className={`${input} resize-y min-h-[80px]`} />
      </div>

      <div>
        <label className={label}>Gallery (photos & videos)</label>
        <label className="flex flex-col items-center justify-center w-full min-h-[88px] border border-dashed border-brand-border rounded-lg bg-[#121212] hover:border-brand/50 cursor-pointer px-3 py-4 transition">
          <input type="file" accept="image/*,video/*" multiple onChange={handleGalleryUpload} disabled={galleryUploading} className="sr-only" />
          <span className="text-sm text-brand-fg">{galleryUploading ? 'Uploading…' : 'Add photos or videos'}</span>
          <span className="text-xs text-brand-muted mt-1">Multiple files allowed</span>
        </label>
        {galleryPreview.length > 0 && (
          <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {galleryPreview.map((g, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-brand-border bg-black/40">
                {g.type === 'video' ? (
                  <video src={`${BACKEND_URL}${g.url}`} className="w-full h-full object-cover" />
                ) : (
                  <img src={`${BACKEND_URL}${g.url}`} alt="" className="w-full h-full object-cover" />
                )}
                <button type="button" onClick={() => removeGalleryItem(i)} className="absolute top-0.5 right-0.5 bg-black/80 text-white text-xs w-5 h-5 rounded-full">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} className="bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
          {editingIndex !== null ? 'Save changes' : 'Add ministry'}
        </button>
        {editingIndex !== null && (
          <button type="button" onClick={cancelEdit} className="text-sm text-brand-muted hover:text-brand-fg px-3 py-2">Cancel</button>
        )}
      </div>
    </div>
  );

  const content =
    items.length > 0 ? (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Ministries ({items.length})</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead>
              <tr className="bg-[#141414]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Cover</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Title</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Description</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Gallery</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 border-b border-brand-border/70">
                    {m.image ? (
                      <img src={`${BACKEND_URL}${m.image}`} alt="" className="w-12 h-12 object-cover rounded-md border border-brand-border" />
                    ) : (
                      <span className="text-brand-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg font-medium">{m.title}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted max-w-[200px] truncate">{m.desc || '—'}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted">{(m.gallery || []).length}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-right whitespace-nowrap">
                    <button type="button" onClick={() => startEdit(i)} className="text-brand hover:text-brand-soft text-sm font-medium mr-3">Edit</button>
                    <button type="button" onClick={() => handleDelete(i)} className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : null;

  return { form, content };
}
