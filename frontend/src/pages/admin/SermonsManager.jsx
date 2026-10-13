const BACKEND_URL = '';
const BLANK_SERMON = {
  series: '',
  title: '',
  speaker: '',
  date: '',
  duration: '',
  scripture: '',
  tags: '',
  videoUrl: '',
  audioUrl: '',
  notesUrl: '',
};

// Builds the add/edit sermon form (form) and the existing-sermons list
// (content) for the sermons field, sharing ephemeral draft/editing state
// lifted from the parent (AdminDashboard). Mirrors the pattern used by
// EventsManager/MinistriesManager, but adds file uploads for audio (MP3)
// and sermon notes (PDF) alongside the existing YouTube video link.
export function buildSermonsField(items, onChange, ui, setUi, uploadMedia) {
  const draft = ui.draft || BLANK_SERMON;
  const uploadingAudio = ui.uploadingAudio || false;
  const uploadingNotes = ui.uploadingNotes || false;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const updateDraftField = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUi({ uploadingAudio: true, error: '' });
    try {
      const { url } = await uploadMedia(file);
      setUi({ uploadingAudio: false, draft: { ...draft, audioUrl: url } });
    } catch (err) {
      setUi({ uploadingAudio: false, error: err.message });
    }
  };

  const handleNotesUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUi({ uploadingNotes: true, error: '' });
    try {
      const { url } = await uploadMedia(file);
      setUi({ uploadingNotes: false, draft: { ...draft, notesUrl: url } });
    } catch (err) {
      setUi({ uploadingNotes: false, error: err.message });
    }
  };

  const startEdit = (i) => setUi({ editingIndex: i, draft: items[i], error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_SERMON, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.title.trim()) {
      setUi({ error: 'Sermon title is required' });
      return;
    }
    if (!draft.videoUrl && !draft.audioUrl) {
      setUi({ error: 'Add a video link or an audio file so people can actually listen' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_SERMON, editingIndex: null, error: '' });
  };

  const form = (
    <div className="rounded-xl border border-brand-border bg-[#0f0f0f] p-5 sm:p-6 space-y-5">
      <h3 className="text-base font-semibold text-brand-fg">
        {editingIndex !== null ? 'Edit Sermon' : 'Add New Sermon'}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Series Label</label>
          <input
            value={draft.series}
            onChange={(e) => updateDraftField('series', e.target.value)}
            placeholder="SERIES 2026"
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Sermon Title</label>
          <input
            value={draft.title}
            onChange={(e) => updateDraftField('title', e.target.value)}
            placeholder="The Power of Prayer"
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Speaker</label>
          <input
            value={draft.speaker}
            onChange={(e) => updateDraftField('speaker', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Date</label>
          <input
            value={draft.date}
            onChange={(e) => updateDraftField('date', e.target.value)}
            placeholder="July 13, 2026"
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Duration</label>
          <input
            value={draft.duration}
            onChange={(e) => updateDraftField('duration', e.target.value)}
            placeholder='42 min (or "Live")'
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Scripture Reference</label>
          <input
            value={draft.scripture}
            onChange={(e) => updateDraftField('scripture', e.target.value)}
            placeholder="Matthew 6:5-15"
            className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Topics (comma separated)</label>
        <input
          value={draft.tags}
          onChange={(e) => updateDraftField('tags', e.target.value)}
          placeholder="prayer, faith, healing"
          className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Video Link (YouTube URL)</label>
        <input
          value={draft.videoUrl}
          onChange={(e) => updateDraftField('videoUrl', e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-3.5 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm text-brand-fg placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Audio File (MP3, for podcast listening)</label>
          {draft.audioUrl && (
            <audio controls src={`${BACKEND_URL}${draft.audioUrl}`} className="w-full my-2 h-10" />
          )}
          <input type="file" accept="audio/*" onChange={handleAudioUpload} disabled={uploadingAudio} />
          {uploadingAudio && <p className="text-xs text-brand-muted mt-1">Uploading...</p>}
          {draft.audioUrl && (
            <button
              type="button"
              onClick={() => updateDraftField('audioUrl', '')}
              className="text-xs text-red-400 hover:underline mt-1"
            >
              Remove audio
            </button>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1.5">Sermon Notes (PDF, optional)</label>
          {draft.notesUrl && (
            <p className="text-xs text-brand-deep my-2 truncate">📄 {draft.notesUrl.split('/').pop()}</p>
          )}
          <input type="file" accept="application/pdf" onChange={handleNotesUpload} disabled={uploadingNotes} />
          {uploadingNotes && <p className="text-xs text-brand-muted mt-1">Uploading...</p>}
          {draft.notesUrl && (
            <button
              type="button"
              onClick={() => updateDraftField('notesUrl', '')}
              className="text-xs text-red-400 hover:underline mt-1"
            >
              Remove notes
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-brand hover:bg-brand-deep text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Sermon'}
        </button>
        {editingIndex !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm text-brand-muted hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  const content = items.length > 0 ? (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Sermons ({items.length})</h3>
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-[#0f0f0f]">
        <table className="w-full text-sm text-left min-w-[720px]">
          <thead>
            <tr className="bg-[#141414]">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Series</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Title</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Speaker</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border">Media</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted border-b border-brand-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((sermon, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted whitespace-nowrap">{sermon.series || '—'}</td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-fg font-medium max-w-[200px] truncate">{sermon.title}</td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted">{sermon.speaker || '—'}</td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted whitespace-nowrap">{sermon.date || '—'}</td>
                <td className="px-4 py-3 border-b border-brand-border/70 text-brand-muted text-xs">
                  {[sermon.videoUrl && 'Video', sermon.audioUrl && 'Audio', sermon.notesUrl && 'Notes'].filter(Boolean).join(' · ') || '—'}
                </td>
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