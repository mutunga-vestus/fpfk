import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { slugify } from '../utils/slugify';

const BACKEND_URL = 'http://localhost:4000';

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
        <h1 className="text-3xl font-bold mb-4">Ministry not found</h1>
        <Link to="/ministries" className="text-indigo-600 font-medium hover:underline">
          &larr; Back to Ministries
        </Link>
      </div>
    );
  }

  const gallery = ministry.gallery || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <Link to="/ministries" className="text-indigo-600 font-medium hover:underline">
        &larr; Back to Ministries
      </Link>

      <h1 className="text-5xl font-bold mt-6 mb-4">{ministry.title}</h1>
      {ministry.desc && (
        <p className="text-xl text-slate-600 mb-10 max-w-3xl">{ministry.desc}</p>
      )}

      {ministry.image && (
        <img
          src={`${BACKEND_URL}${ministry.image}`}
          alt={ministry.title}
          className="w-full max-h-[420px] object-cover rounded-3xl mb-12"
        />
      )}

      <h2 className="text-2xl font-semibold mb-6">Photos &amp; Videos</h2>

      {gallery.length === 0 ? (
        <p className="text-slate-500">No photos or videos have been added for this ministry yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((g, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 bg-black/5">
              {g.type === 'video' ? (
                <video
                  src={`${BACKEND_URL}${g.url}`}
                  controls
                  className="w-full h-64 object-cover bg-black"
                />
              ) : (
                <img
                  src={`${BACKEND_URL}${g.url}`}
                  alt={ministry.title}
                  className="w-full h-64 object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}