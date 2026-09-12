const BACKEND_URL = 'http://localhost:4000';
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
    <div className="border border-indigo-200 bg-indigo-50 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Sermon' : 'Add New Sermon'}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Series Label</label>
          <input
            value={draft.series}
            onChange={(e) => updateDraftField('series', e.target.value)}
            placeholder="SERIES 2026"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Sermon Title</label>
          <input
            value={draft.title}
            onChange={(e) => updateDraftField('title', e.target.value)}
            placeholder="The Power of Prayer"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Speaker</label>
          <input
            value={draft.speaker}
            onChange={(e) => updateDraftField('speaker', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Date</label>
          <input
            value={draft.date}
            onChange={(e) => updateDraftField('date', e.target.value)}
            placeholder="July 13, 2026"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Duration</label>
          <input
            value={draft.duration}
            onChange={(e) => updateDraftField('duration', e.target.value)}
            placeholder='42 min (or "Live")'
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Scripture Reference</label>
          <input
            value={draft.scripture}
            onChange={(e) => updateDraftField('scripture', e.target.value)}
            placeholder="Matthew 6:5-15"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500">Topics (comma separated)</label>
        <input
          value={draft.tags}
          onChange={(e) => updateDraftField('tags', e.target.value)}
          placeholder="prayer, faith, healing"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Video Link (YouTube URL)</label>
        <input
          value={draft.videoUrl}
          onChange={(e) => updateDraftField('videoUrl', e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Audio File (MP3, for podcast listening)</label>
          {draft.audioUrl && (
            <audio controls src={`${BACKEND_URL}${draft.audioUrl}`} className="w-full my-2 h-10" />
          )}
          <input type="file" accept="audio/*" onChange={handleAudioUpload} disabled={uploadingAudio} />
          {uploadingAudio && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
          {draft.audioUrl && (
            <button
              type="button"
              onClick={() => updateDraftField('audioUrl', '')}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Remove audio
            </button>
          )}
        </div>
        <div>
          <label className="text-xs text-gray-500">Sermon Notes (PDF, optional)</label>
          {draft.notesUrl && (
            <p className="text-xs text-indigo-700 my-2 truncate">📄 {draft.notesUrl.split('/').pop()}</p>
          )}
          <input type="file" accept="application/pdf" onChange={handleNotesUpload} disabled={uploadingNotes} />
          {uploadingNotes && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
          {draft.notesUrl && (
            <button
              type="button"
              onClick={() => updateDraftField('notesUrl', '')}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Remove notes
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Sermon'}
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
      <h3 className="font-semibold text-gray-800">Current Sermons ({items.length})</h3>
      {items.map((sermon, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-center bg-gray-50">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-indigo-600 font-medium">{sermon.series}</div>
            <div className="font-semibold truncate">{sermon.title}</div>
            <div className="text-sm text-gray-500 truncate">
              {sermon.speaker} • {sermon.date}
              {sermon.videoUrl ? ' • 🎥 video' : ''}
              {sermon.audioUrl ? ' • 🎧 audio' : ''}
              {sermon.notesUrl ? ' • 📄 notes' : ''}
            </div>
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