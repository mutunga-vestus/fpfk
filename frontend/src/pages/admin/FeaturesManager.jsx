const BLANK = { text: '', reference: '' };
const label = 'block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5';
const input = 'w-full px-3.5 py-2.5 bg-[#121212] border border-brand-border rounded-lg text-sm text-brand-fg placeholder:text-brand-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/35 focus:border-brand transition';

export function buildFeaturesField(items, onChange, ui, setUi) {
  const draft = ui.draft || BLANK;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const update = (key, value) => setUi({ draft: { ...draft, [key]: value } });
  const startEdit = (i) => setUi({ editingIndex: i, draft: { ...BLANK, ...items[i] }, error: '' });
  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK, error: '' });
  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };
  const handleSubmit = () => {
    if (!draft.text.trim()) {
      setUi({ error: 'Verse / text is required' });
      return;
    }
    if (items.length >= 10 && editingIndex === null) {
      setUi({ error: 'Maximum 10 cards allowed' });
      return;
    }
    if (editingIndex !== null) onChange(items.map((item, idx) => (idx === editingIndex ? draft : item)));
    else onChange([...items, draft]);
    setUi({ draft: BLANK, editingIndex: null, error: '' });
  };

  const form = (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <h3 className="text-sm font-semibold text-brand-fg">
          {editingIndex !== null ? 'Edit verse / card' : 'Add verse / card'}
        </h3>
        <span className="text-xs text-brand-muted">{items.length}/10</span>
      </div>
      <div>
        <label className={label}>Verse / text <span className="text-red-400">*</span></label>
        <textarea value={draft.text} onChange={(e) => update('text', e.target.value)} rows={3} placeholder="For God so loved the world…" className={`${input} resize-y min-h-[80px]`} />
      </div>
      <div>
        <label className={label}>Reference</label>
        <input value={draft.reference} onChange={(e) => update('reference', e.target.value)} placeholder="John 3:16" className={input} />
      </div>
      {error && <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} className="bg-brand hover:bg-brand-deep text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition">
          {editingIndex !== null ? 'Save changes' : 'Add card'}
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Cards ({items.length})</h3>
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
          <table className="w-full text-sm text-left min-w-[480px]">
            <thead>
              <tr className="bg-[#141414]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">#</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Text</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Reference</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted">{i + 1}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg max-w-[280px] truncate italic">{f.text}</td>
                  <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted">{f.reference || f.desc || '—'}</td>
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
