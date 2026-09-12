import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import { adminSchema } from '../../config/adminSchema';
import { buildEventsField } from './EventsManager';
import { buildMinistriesField } from './MinistriesManager';
import { buildPostersField } from './PostersManager';
import { buildFeaturesField } from './FeaturesManager';
import AdminMessages from './AdminMessages';
import AdminGiving from './AdminGiving';
import AdminEventRegistrations from './AdminEventRegistrations';
import fpfkLogo from '../../assets/fpfk-logo.png';
import { buildLeadersField } from './LeadersManager';

const BACKEND_URL = 'http://localhost:4000';

// Builds the upload control (form) and the current-image preview (content)
// for an image field, sharing ephemeral upload state lifted from the parent.
function buildImageField(field, value, onChange, ui, setUi, uploadImage) {
  const uploading = ui.uploading || false;
  const error = ui.error || '';

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUi({ uploading: true, error: '' });
    try {
      const url = await uploadImage(file);
      onChange(url);
      setUi({ uploading: false });
    } catch (err) {
      setUi({ uploading: false, error: err.message });
    }
  };

  const form = (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700"
      />
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  const content = value ? (
    <div className="space-y-3">
      <img
        src={`${BACKEND_URL}${value}`}
        alt="Preview"
        className="w-full max-w-full sm:max-w-sm h-40 sm:h-48 object-cover rounded-xl border border-gray-200"
      />
      <button
        type="button"
        onClick={() => onChange('')}
        className="text-sm text-red-500 hover:underline"
      >
        Remove image
      </button>
    </div>
  ) : null;

  return { form, content };
}

// Builds the add/edit form and the existing-items list for a list field,
// sharing ephemeral draft/editing state lifted from the parent.
function buildListField(field, items, onChange, ui, setUi) {
  const blank = Object.fromEntries(field.itemFields.map((f) => [f.key, '']));
  const draft = ui.draft || blank;
  const editingIndex = ui.editingIndex ?? null;
  const error = ui.error || '';

  const updateDraft = (key, value) => setUi({ draft: { ...draft, [key]: value } });

  const startEdit = (i) => setUi({ editingIndex: i, draft: items[i], error: '' });

  const cancelEdit = () => setUi({ editingIndex: null, draft: blank, error: '' });

  const handleDelete = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  const handleSubmit = () => {
    const hasContent = Object.values(draft).some((v) => v.trim());
    if (!hasContent) {
      setUi({ error: 'Fill in at least one field before saving.' });
      return;
    }
    if (editingIndex !== null) {
      const updated = items.map((item, idx) => (idx === editingIndex ? draft : item));
      onChange(updated);
    } else {
      onChange([...items, draft]);
    }
    setUi({ draft: blank, editingIndex: null, error: '' });
  };

  const form = (
    <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-3 sm:p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">
        {editingIndex !== null ? `Edit ${field.label.replace(/s$/, '')}` : `Add New ${field.label.replace(/s$/, '')}`}
      </h4>
      {field.itemFields.map((sf) => (
        <div key={sf.key}>
          <label className="text-xs text-gray-500">{sf.label}</label>
          <input
            value={draft[sf.key] || ''}
            onChange={(e) => updateDraft(sf.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {editingIndex !== null ? 'Save Changes' : `+ Add ${field.label.replace(/s$/, '')}`}
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
    <div className="space-y-2">
      {items.map((item, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl p-3 sm:p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            {field.itemFields.map((sf) => (
              <div key={sf.key} className="text-sm">
                <span className="text-gray-400">{sf.label}: </span>
                <span className="text-gray-700 break-words">{item[sf.key] || '—'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 sm:gap-3 shrink-0">
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

export default function AdminDashboard() {
  const { content, loading, savePage, uploadImage, uploadMedia } = useContent();
  const [activePage, setActivePage] = useState('home');
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState('');
  const [fieldUi, setFieldUi] = useState({});
  const navigate = useNavigate();

  if (loading || !content) return <div className="p-10 text-center">Loading...</div>;

  const currentDraft = draft ?? content[activePage];
  const schema = adminSchema[activePage];

  const selectPage = (page) => {
    setActivePage(page);
    setDraft(null);
    setStatus('');
    setFieldUi({});
  };

  const updateField = (key, value) => {
    setDraft({ ...currentDraft, [key]: value });
  };

  const getUi = (key) => fieldUi[key] || {};
  const setUi = (key, patch) =>
    setFieldUi((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handleSave = async () => {
    setStatus('Saving...');
    try {
      await savePage(activePage, currentDraft);
      setStatus('Saved!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  const tabClass = (key) =>
    `whitespace-nowrap px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activePage === key
        ? 'bg-white text-indigo-700 shadow-sm'
        : 'text-indigo-200 hover:text-white hover:bg-white/10'
    }`;

  // Split every field into its editable "form" piece and its read-only
  // "updated content" piece, so the page renders: forms -> Save button -> content.
  const formSections = [];
  const contentSections = [];

  if (schema) {
    schema.fields.forEach((field) => {
      const key = field.key;
      const label = (
        <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
      );

      if (field.type === 'text') {
        formSections.push(
          <div key={key}>
            {label}
            <input
              value={currentDraft[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-sm sm:text-base"
            />
          </div>
        );
        return;
      }

      if (field.type === 'textarea') {
        formSections.push(
          <div key={key}>
            {label}
            <textarea
              value={currentDraft[key] || ''}
              onChange={(e) => updateField(key, e.target.value)}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-sm sm:text-base"
            />
          </div>
        );
        return;
      }

      if (field.type === 'image') {
        const { form, content } = buildImageField(
          field,
          currentDraft[key],
          (url) => updateField(key, url),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'list') {
        const { form, content } = buildListField(
          field,
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch)
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'features') {
  const { form, content: fieldContent } = buildFeaturesField(
    currentDraft[key] || [],
    (items) => updateField(key, items),
    getUi(key),
    (patch) => setUi(key, patch)
  );
  formSections.push(
    <div key={key}>
      {label}
      {form}
    </div>
  );
  if (fieldContent) {
    contentSections.push(
      <div key={`${key}-content`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current {field.label}
        </label>
        {fieldContent}
      </div>
    );
  }
  return;
}

      if (field.type === 'events') {
        const { form, content } = buildEventsField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }

      if (field.type === 'ministries') {
        const { form, content } = buildMinistriesField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadMedia
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
        return;
      }
            if (field.type === 'leaders') {
        const { form, content: fieldContent } = buildLeadersField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (fieldContent) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current {field.label}
              </label>
              {fieldContent}
            </div>
          );
        }
        return;
      }

      if (field.type === 'posters') {
        const { form, content } = buildPostersField(
          currentDraft[key] || [],
          (items) => updateField(key, items),
          getUi(key),
          (patch) => setUi(key, patch),
          uploadImage
        );
        formSections.push(
          <div key={key}>
            {label}
            {form}
          </div>
        );
        if (content) {
          contentSections.push(
            <div key={`${key}-content`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current {field.label}
              </label>
              {content}
            </div>
          );
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-indigo-950 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img
                src={fpfkLogo}
                alt="FPFK Church Kitengela logo"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover shrink-0"
              />
              <span className="font-semibold text-white text-sm sm:text-base truncate">Admin Panel</span>
            </div>
            <button
              onClick={logout}
              className="text-xs sm:text-sm text-indigo-200 hover:text-white shrink-0 ml-2"
            >
              Log Out
            </button>
          </div>

          {/* Dropdown nav — small screens only */}
          <div className="sm:hidden pb-3">
            <select
              value={activePage}
              onChange={(e) => selectPage(e.target.value)}
              className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              {Object.entries(adminSchema).map(([key, s]) => (
                <option key={key} value={key} className="text-gray-900">
                  {s.label}
                </option>
              ))}
              <option value="messages" className="text-gray-900">
                Messages
              </option>
              <option value="giving" className="text-gray-900">
                Giving Records
              </option>
              <option value="registrations" className="text-gray-900">
                Event Registrations
              </option>
            </select>
          </div>

          {/* Button nav — sm screens and up */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-3">
            {Object.entries(adminSchema).map(([key, s]) => (
              <button key={key} onClick={() => selectPage(key)} className={tabClass(key)}>
                {s.label}
              </button>
            ))}
            <span className="w-px h-5 bg-white/20 mx-1 shrink-0" />
            <button onClick={() => selectPage('messages')} className={tabClass('messages')}>
              Messages
            </button>
            <button onClick={() => selectPage('giving')} className={tabClass('giving')}>
              Giving Records
            </button>
            <button onClick={() => selectPage('registrations')} className={tabClass('registrations')}>
              Event Registrations
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {activePage === 'messages' ? (
          <AdminMessages />
        ) : activePage === 'giving' ? (
          <AdminGiving />
        ) : activePage === 'registrations' ? (
          <AdminEventRegistrations />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8 space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Update {schema.label} Content</h1>

            {formSections}

            <div className="space-y-2">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700"
              >
                Save Changes
              </button>
              {status && <p className="text-sm text-gray-600">{status}</p>}
            </div>

            {contentSections.length > 0 && (
              <div className="pt-4 border-t border-gray-100 space-y-6">
                {contentSections}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}