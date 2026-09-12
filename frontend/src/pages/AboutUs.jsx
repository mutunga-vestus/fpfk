import { useContent } from '../context/ContentContext';

const BACKEND_URL = 'http://localhost:4000';

export default function AboutUs() {
  const { content, loading } = useContent();
  if (loading) return null;
  const { heroImage, title, subtitle, story, beliefs, leaders = [] } = content.about;

  return (
    <div>
      <div
        className={`relative min-h-[420px] py-28 flex items-center justify-center text-white overflow-hidden ${
          !heroImage ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950' : 'bg-indigo-950'
        }`}
      >
        {heroImage && (
          <img
            src={`${BACKEND_URL}${heroImage}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          <p className="text-xl text-indigo-100">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="prose prose-lg mx-auto">
          <h2 className="text-xl text-center text-black font-bold uppercase italic mb-3">Our Story</h2>
          <p className="font-bold">{story}</p>

          <h2 className="text-xl text-center text-black font-bold uppercase italic mt-12 mb-3">What We Believe</h2>
          <p className="font-bold">{beliefs}</p>

          <h2 className="text-xl text-center text-black font-bold uppercase italic mt-12 mb-3">Our Mission</h2>
          <p className="font-bold">
            Equiping one to touch one for integrity and Mission
            <br />
            Mark 16:15; And He said unto them, &apos;Go ye into the all the world and preach the gospel to every creature&apos;
          </p>

          <h2 className="text-xl text-center text-black font-bold uppercase italic mt-12 mb-3">Our Vission</h2>
          <p className="font-bold">
            Let&apos;s connect the world to Jesus Christ
            <br />
            2 chron. 7:15; &quot;Now mine eyes shall be open, and mine ears attentive to the prayer that is made in this place&quot;
          </p>
        </div>
      </div>

      {leaders.length > 0 && (
        <div className="bg-slate-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl text-center text-black font-bold uppercase italic mb-3">
              Meet Our Leaders
            </h2>
            <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
              Jeremiah 3:15
              <br />
              And I will give you shepherds after my own heart, who will feed you with knowledge and understanding.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {leaders.map((l, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-center"
                >
                  <div className="aspect-square bg-indigo-950 overflow-hidden">
                    {l.image ? (
                      <img
                        src={`${BACKEND_URL}${l.image}`}
                        alt={l.name || 'Leader'}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl font-bold text-white/80">
                          {(l.name || '?').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900">{l.name}</h3>
                    {l.role && (
                      <p className="text-sm font-semibold text-indigo-600 mt-1">{l.role}</p>
                    )}
                    {l.bio && (
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-line">
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