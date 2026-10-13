import { useContent } from '../context/ContentContext';

const BACKEND_URL = '';

export default function AboutUs() {
  const { content, loading } = useContent();
  if (loading) return null;
  const { heroImage, title, subtitle, story, beliefs, leaders = [] } = content.about;

  return (
    <div>
      <div
        className={`relative min-h-[420px] py-28 flex items-center justify-center text-white overflow-hidden ${
          !heroImage ? 'bg-gradient-to-br from-brand-dark via-gray-900 to-brand-dark' : 'bg-brand-dark'
        }`}
      >
        {heroImage && (
          <button
            type="button"
            onClick={() => window.open(`${BACKEND_URL}${heroImage}`, '_blank', 'noopener,noreferrer')}
            className="absolute inset-0 w-full h-full focus:outline-none group"
            aria-label="View hero photo"
          >
            <img
              src={`${BACKEND_URL}${heroImage}`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover cursor-pointer transition group-hover:opacity-95"
            />
          </button>
        )}
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pointer-events-none">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          <p className="text-xl text-brand-light">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="prose prose-lg mx-auto">
          <h2 className="text-xl text-center text-brand-fg font-bold uppercase italic mb-3">Our Story</h2>
          <p className="font-bold text-brand-fg">{story}</p>

          <h2 className="text-xl text-center text-brand-fg font-bold uppercase italic mt-12 mb-3">What We Believe</h2>
          <p className="font-bold text-brand-fg">{beliefs}</p>

          <h2 className="text-xl text-center text-brand-fg font-bold uppercase italic mt-12 mb-3">Our Mission</h2>
          <p className="font-bold text-brand-fg">
            Equiping one to touch one for integrity and Mission
            <br />
            Mark 16:15; And He said unto them, &apos;Go ye into the all the world and preach the gospel to every creature&apos;
          </p>

          <h2 className="text-xl text-center text-brand-fg font-bold uppercase italic mt-12 mb-3">Our Vission</h2>
          <p className="font-bold text-brand-fg">
            Let&apos;s connect the world to Jesus Christ
            <br />
            2 chron. 7:15; &quot;Now mine eyes shall be open, and mine ears attentive to the prayer that is made in this place&quot;
          </p>
        </div>
      </div>

      {leaders.length > 0 && (
        <div className="bg-brand-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl text-center text-brand-fg font-bold uppercase italic mb-3">
              Meet Our Leaders
            </h2>
            <p className="text-center text-brand-muted mb-12 max-w-2xl mx-auto">
              Jeremiah 3:15
              <br />
              And I will give you shepherds after my own heart, who will feed you with knowledge and understanding.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {leaders.map((l, i) => (
                <div
                  key={i}
                  className="bg-brand-dark rounded-2xl border border-brand-border shadow-sm overflow-hidden text-center"
                >
                  <div className="aspect-square bg-brand-dark overflow-hidden">
                    {l.image ? (
                      <button
                        type="button"
                        onClick={() => {
                        window.location.href = `${BACKEND_URL}${l.image}`;
                           }}
                        className="block w-full h-full focus:outline-none group"
                      >
                        <img
                          src={`${BACKEND_URL}${l.image}`}
                          alt={l.name || 'Leader'}
                          className="w-full h-full object-cover object-top cursor-pointer transition group-hover:opacity-90"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/80">
                          {(l.name || '?').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-brand-fg">{l.name}</h3>
                    {l.role && (
                      <p className="text-sm font-semibold text-brand mt-1">{l.role}</p>
                    )}
                    {l.bio && (
                      <p className="text-sm text-brand-muted mt-3 leading-relaxed whitespace-pre-line">
                        {l.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}