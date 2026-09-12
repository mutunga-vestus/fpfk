const BLANK_FEATURE = { text: '', reference: '' };
const MAX_FEATURES = 10;

// Builds the add/edit form and existing-items list for the homepage
// "Bible Verses" section (the row of text cards below the poster slideshow).
// Each item is plain editable text (e.g. a Bible verse) plus an optional
// reference. Maximum of 10 items.
export function buildFeaturesField(items, onChange, ui, setUi) {
  const draft = ui.draft || BLANK_FEATURE;
  const error = ui.error || '';
  const editingIndex = ui.editingIndex ?? null;

  const updateDraftField = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const startEdit = (i) =>
    setUi({ editingIndex: i, draft: { ...BLANK_FEATURE, ...items[i] }, error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: BLANK_FEATURE, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    if (!draft.text.trim()) {
      setUi({ error: 'Verse / text is required' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      if (items.length >= MAX_FEATURES) {
        setUi({ error: `Maximum of ${MAX_FEATURES} items allowed` });
        return;
      }
      onChange([...items, draft]);
    }
    setUi({ draft: BLANK_FEATURE, editingIndex: null, error: '' });
  };

  const atLimit = items.length >= MAX_FEATURES && editingIndex === null;

  const form = (
    <div className="border border-indigo-200 bg-indigo-50 rounded-2xl p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">
        {editingIndex !== null ? 'Edit Verse / Text' : 'Add New Verse / Text'}
      </h3>
      <p className="text-xs text-gray-500">
        Up to {MAX_FEATURES} items. {items.length} / {MAX_FEATURES} used.
      </p>

      <div>
        <label className="text-xs text-gray-500">Verse / Text</label>
        <textarea
          value={draft.text}
          onChange={(e) => updateDraftField('text', e.target.value)}
          placeholder="For God so loved the world that he gave his one and only Son..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-y"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">Reference (optional)</label>
        <input
          value={draft.reference}
          onChange={(e) => updateDraftField('reference', e.target.value)}
          placeholder="John 3:16"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {atLimit && (
        <p className="text-sm text-amber-700">
          Limit of {MAX_FEATURES} reached. Delete one or edit an existing item.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={atLimit}
          className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {editingIndex !== null ? 'Save Changes' : '+ Add Verse / Text'}
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
        {items.map((f, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-3 sm:p-4 flex gap-4 items-start bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-3">
                {f.text || '(empty)'}
              </p>
              {f.reference && (
                <p className="text-xs font-medium text-indigo-600 mt-1">{f.reference}</p>
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