import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { slugify } from '../utils/slugify';

const BACKEND_URL = 'http://localhost:4000';

// Fade carousel for the ministries preview on the home page.
// Slides crossfade automatically and each slide links to its
// ministry detail page (/ministries/:slug).
function MinistryCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="relative h-[420px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((m, i) => (
        <Link
          key={i}
          to={`/ministries/${slugify(m.title) || i}`}
          aria-hidden={i !== index}
          tabIndex={i === index ? 0 : -1}
          className={`group absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div
            className={`relative w-full h-full flex items-end ${
              !m.image ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950' : ''
            }`}
            style={
              m.image
                ? {
                    backgroundImage: `url(${BACKEND_URL}${m.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="relative z-10 p-8 md:p-14 text-white max-w-2xl">
              <h3 className="text-3xl md:text-5xl font-bold mb-4">{m.title}</h3>
              {m.desc && (
                <p className="text-lg md:text-xl text-indigo-100 mb-2">{m.desc}</p>
              )}
              <span className="inline-block mt-4 font-semibold text-white group-hover:underline underline-offset-4">
                Learn more &rarr;
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Fade slideshow for admin-uploaded posters (e.g. "Year of Open Doors",
// "Month of Divine Perfection"). Sits right below the hero section (with a
// gap between them), stretches edge-to-edge, and shows each poster's
// caption above the image rather than overlaid on top of it.
function PosterCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div
      className="relative z-0 mt-10 md:mt-16 w-full h-[320px] md:h-[480px] bg-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((p, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex flex-col transition-opacity duration-[2000ms] ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {p.title && (
            <div className="bg-white text-slate-900 text-center py-3 px-6">
              <p className="text-lg md:text-2xl font-semibold">{p.title}</p>
            </div>
          )}
          <img
            src={`${BACKEND_URL}${p.image}`}
            alt={p.title || 'Poster'}
            className="w-full flex-1 min-h-0 object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { content, loading } = useContent();
  if (loading) return null;
  const { heroImage, heroTitle, heroSubtitle, ctaPrimary, ctaSecondary, features } = content.home;
  const ministries = content.ministries || {};
  const posters = content.home.posters || [];

  const heroStyle = heroImage
    ? {
        backgroundImage: `url(${BACKEND_URL}${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <div>
      <div
        className={`relative h-screen flex items-center justify-center text-white overflow-hidden ${
          !heroImage ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950' : ''
        }`}
        style={heroStyle}
      >
        {/* Dark overlay so text stays readable over any photo */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-7l font-bold mb-6 leading-tight whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="text-2xl md:text-3xl mb-10 text-indigo-100">{heroSubtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/connect"
              className="bg-white text-indigo-900 px-10 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all inline-block"
            >
              {ctaPrimary}
            </Link>
            <Link
              to="/sermons"
              className="border border-white/70 hover:bg-white/10 px-10 py-4 rounded-full font-semibold text-lg transition-all"
            >
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      <PosterCarousel items={posters} />

      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <Link
              key={i}
              to="/ministries"
              className="group text-center block rounded-2xl p-6 -m-2 transition-colors hover:bg-slate-50"
            >
              {f.image && (
                <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-6 shadow-md">
                  <img
                    src={`${BACKEND_URL}${f.image}`}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              )}
              <h3 className="text-2xl font-semibold group-hover:text-indigo-600 transition-colors">
                {f.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {ministries.items && ministries.items.length > 0 && (
        <div className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-3">
              {ministries.title || 'Our Ministries'}
            </h2>
            {ministries.subtitle && (
              <p className="text-center text-lg text-slate-600 mb-12">
                {ministries.subtitle}
              </p>
            )}

            <MinistryCarousel items={ministries.items} />

            <div className="text-center mt-10">
              <Link
                to="/ministries"
                className="inline-block text-indigo-600 font-semibold hover:underline underline-offset-4"
              >
                View all ministries &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}