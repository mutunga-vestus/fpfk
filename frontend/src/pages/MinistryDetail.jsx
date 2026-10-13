import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { slugify } from '../utils/slugify';

const BACKEND_URL = '';

export default function MinistryDetail() {
  const { slug } = useParams();
  const { content, loading } = useContent();

  if (loading) return null;

  const items = content?.ministries?.items || [];
  const index = items.findIndex((m, i) => (slugify(m.title) || String(i)) === slug);
  const ministry = index >= 0 ? items[index] : null;

  if (!ministry) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4 text-brand-fg">Ministry not found</h1>
        <Link to="/ministries" className="text-brand font-medium hover:underline">
          &larr; Back to Ministries
        </Link>
      </div>
    );
  }

  const gallery = ministry.gallery || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <Link to="/ministries" className="text-brand font-medium hover:underline">
        &larr; Back to Ministries
      </Link>

      <h1 className="text-5xl font-bold mt-6 mb-4 text-brand-fg">{ministry.title}</h1>
      {ministry.desc && (
        <p className="text-xl text-brand-muted mb-10 max-w-3xl">{ministry.desc}</p>
      )}

      {ministry.image && (
        <button
          type="button"
          onClick={() => {
              window.location.href = `${BACKEND_URL}${ministry.image}`;
            }}
          className="block w-full mb-12 focus:outline-none group"
        >
          <img
            src={`${BACKEND_URL}${ministry.image}`}
            alt={ministry.title}
            className="w-full max-h-[420px] object-cover rounded-3xl cursor-pointer transition group-hover:opacity-95"
          />
        </button>
      )}

      <h2 className="text-2xl font-semibold mb-6 text-brand-fg">Photos &amp; Videos</h2>

      {gallery.length === 0 ? (
        <p className="text-brand-muted">No photos or videos have been added for this ministry yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((g, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-brand-border bg-black/5">
              {g.type === 'video' ? (
                <video
                  src={`${BACKEND_URL}${g.url}`}
                  controls
                  className="w-full h-64 object-cover bg-black"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {window.location.href = `${BACKEND_URL}${g.url}`;}}
                  className="block w-full focus:outline-none group"
                >
                  <img
                    src={`${BACKEND_URL}${g.url}`}
                    alt={ministry.title}
                    className="w-full h-64 object-cover cursor-pointer transition group-hover:opacity-90"
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}