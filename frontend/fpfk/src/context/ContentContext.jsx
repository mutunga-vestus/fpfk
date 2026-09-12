import { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000/api';
const ContentContext = createContext(null);

function handleAuthFailure() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_email');
  if (!window.location.pathname.startsWith('/admin/login')) {
    window.location.assign('/admin/login?expired=1');
  }
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    try {
      const res = await fetch(`${API_URL}/content`);
      if (!res.ok) throw new Error('Failed to load content');
      setContent(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const savePage = async (page, data) => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/content/${page}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (res.status === 401) return handleAuthFailure();
    if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
    const result = await res.json();
    setContent((prev) => ({ ...prev, [page]: result.page }));
    return result;
  };

  const uploadImage = async (file) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.status === 401) return handleAuthFailure();
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    const { url } = await res.json();
    return url; // e.g. "/uploads/171234-abc.jpg"
  };

  // Same endpoint as uploadImage, but also hands back the detected media
  // type ('image' | 'video') so callers like the ministry gallery can render
  // the right tag without guessing from the file extension.
  const uploadMedia = async (file) => {
    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.status === 401) return handleAuthFailure();
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    const { url, type } = await res.json();
    return { url, type: type || 'image' };
  };

  return (
    <ContentContext.Provider value={{ content, loading, error, savePage, uploadImage, uploadMedia, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}