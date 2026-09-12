import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { slugify } from '../utils/slugify';

const BACKEND_URL = 'http://localhost:4000';

export default function Ministries() {
  const { content, loading } = useContent();
  if (loading) return null;
  const { title, subtitle, items } = content.ministries;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-bold text-center mb-4">{title}</h1>
      <p className="text-center text-xl text-slate-600 mb-16">{subtitle}</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((m, i) => (
          <Link
            key={i}
            to={`/ministries/${slugify(m.title) || i}`}
            className="block border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-xl"
          >
            {m.image && (
              <img
                src={`${BACKEND_URL}${m.image}`}
                alt={m.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-10">
              <h3 className="text-3xl font-semibold mb-4">{m.title}</h3>
              <p className="text-slate-600">{m.desc}</p>
              <span className="inline-block mt-6 text-indigo-600 font-medium">
                View photos &amp; videos &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}