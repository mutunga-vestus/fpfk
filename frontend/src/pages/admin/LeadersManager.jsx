const BACKEND_URL = '';
const BLANK = { image: '', name: '', role: '', bio: '' };
const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input = 'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

export function buildLeadersField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK;
  const uploading = ui.uploading || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const update = (key, value) => setUi({ draft: { ...draft, [key]: value } });
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const url = await uploadImage(file);
      setUi({ uploading: false, draft: { ...draft, image: url } });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
    e.target.value = '';
  };
  const startEdit = (i) => setUi({ editingIndex: i, draft: { ...BLANK, ...items[i] }, error: '' });
  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK, error: '' });
  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };
  const handleSubmit = () => {
    if (!draft.name.trim()) {
      setUi({ error: 'Name is required' });
      return;
    }
    if (editingIndex !== null) onChange(items.map((item, idx) => (idx === editingIndex ? draft : item)));
    else onChange([...items, draft]);
    setUi({ draft: BLANK, editingIndex: null, error: '' });
  };

  const form = (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <h3 className="text-sm font-semibold text-brand-fg border-b border-brand-border pb-3">
        {editingIndex !== null ? 'Edit leader' : 'Add leader'}
      </h3>
      <div>
        <label className={label}>Photo</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {draft.image ? (
            <div className="relative shrink-0">
              <img src={`${BACKEND_URL}${draft.image}`} alt="" className="w-20 h-20 object-cover object-top rounded-lg border border-brand-border" />
              <button type="button" onClick={() => update('image', '')} className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full">×</button>
            </div>
          ) : null}
          <label className="flex flex-col items-center justify-center flex-1 min-h-[80px] border border-dashed border-brand-border rounded-lg bg-[#121212] hover:border-brand/50 cursor-pointer px-3 py-3 transition">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
            <span className="text-sm text-brand-fg">{uploading ? 'Uploading…' : 'Upload photo'}</span>
          </label>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Name <span className="text-red-400">*</span></label>
          <input value={draft.name} onChange={(e) => update('name', e.target.value)} placeholder="Pastor John Doe" className={input} />
        </div>
        <div>
          <label className={label}>Role</label>
          <input value={draft.role} onChange={(e) => update('role', e.target.value)} placeholder="Senior Pastor" className={input} />
        </div>
      </div>
      <div>
        <label className={label}>Bio</label>
        <textarea value={draft.bio} onChange={(e) => update('bio', e.target.value)} rows={3} placeholder="Short introduction…" className={`${input} resize-y min-h-[80px]`} />
      </div>
      {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} className="bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
          {editingIndex !== null ? 'Save changes' : 'Add leader'}
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Leaders ({items.length})</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead>
              <tr className="bg-[#141414]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Photo</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Role</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Bio</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 border-b border-brand-border/70">
                    {l.image ? (
                      <img src={`${BACKEND_URL}${l.image}`} alt="" className="w-10 h-10 rounded-full object-cover object-top border border-brand-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-border flex items-center justify-center text-xs font-bold text-brand-muted">
                        {(l.name || '?')[0]}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg font-medium">{l.name}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted">{l.role || '—'}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted max-w-[200px] truncate">{l.bio || '—'}</td>
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
