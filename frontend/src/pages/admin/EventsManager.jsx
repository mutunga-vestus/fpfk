const BACKEND_URL = '';
const BLANK_EVENT = { image: '', date: '', title: '', desc: '', buttonLabel: 'Register' };

const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input =
  'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

export function buildEventsField(items, onChange, ui, setUi, uploadImage) {
  const draft = ui.draft || BLANK_EVENT;
  const uploading = ui.uploading || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const updateDraftField = (key, value) => setUi({ draft: { ...draft, [key]: value } });

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

  const startEdit = (i) => setUi({ editingIndex: i, draft: { ...BLANK_EVENT, ...items[i] }, error: '' });
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
      onChange(items.map((item, idx) => (idx === editingIndex ? draft : item)));
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_EVENT, editingIndex: null, error: '' });
  };

  const form = (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-brand-border pb-3">
        <h3 className="text-sm font-semibold text-brand-fg">
          {editingIndex !== null ? 'Edit event' : 'Add event'}
        </h3>
        {editingIndex !== null && (
          <button type="button" onClick={cancelEdit} className="text-xs text-brand-muted hover:text-brand-fg">
            Cancel
          </button>
        )}
      </div>

      <div>
        <label className={label}>Flyer / photo</label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {draft.image ? (
            <div className="relative shrink-0">
              <img src={`${BACKEND_URL}${draft.image}`} alt="" className="w-36 h-24 object-cover rounded-lg border border-brand-border" />
              <button type="button" onClick={() => updateDraftField('image', '')} className="absolute top-1.5 right-1.5 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded">
                Remove
              </button>
            </div>
          ) : null}
          <label className="flex flex-col items-center justify-center flex-1 min-h-[96px] border border-dashed border-brand-border rounded-lg bg-[#121212] hover:border-brand/50 cursor-pointer px-3 py-4 transition">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="sr-only" />
            <span className="text-sm text-brand-fg">{uploading ? 'Uploading…' : 'Click to upload flyer'}</span>
            <span className="text-xs text-brand-muted mt-1">Optional · JPG, PNG, WEBP</span>
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Date / time</label>
          <input value={draft.date} onChange={(e) => updateDraftField('date', e.target.value)} placeholder="JULY 25 • 6:00 PM" className={input} />
        </div>
        <div>
          <label className={label}>Button label</label>
          <input value={draft.buttonLabel} onChange={(e) => updateDraftField('buttonLabel', e.target.value)} placeholder="Register" className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Title <span className="text-red-400">*</span></label>
        <input value={draft.title} onChange={(e) => updateDraftField('title', e.target.value)} placeholder="Summer Family Picnic" className={input} />
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea value={draft.desc} onChange={(e) => updateDraftField('desc', e.target.value)} rows={3} placeholder="Short description…" className={`${input} resize-y min-h-[80px]`} />
      </div>

      {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={handleSubmit} className="bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
          {editingIndex !== null ? 'Save changes' : 'Add event'}
        </button>
      </div>
    </div>
  );

  const content =
    items.length > 0 ? (
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Events ({items.length})</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="bg-[#141414]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Flyer</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Title</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Description</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((event, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 border-b border-brand-border/70">
                    {event.image ? (
                      <img src={`${BACKEND_URL}${event.image}`} alt="" className="w-12 h-12 object-cover rounded-md border border-brand-border" />
                    ) : (
                      <span className="text-brand-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted whitespace-nowrap">{event.date || '—'}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg font-medium">{event.title}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted max-w-[220px] truncate">{event.desc || '—'}</td>
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
