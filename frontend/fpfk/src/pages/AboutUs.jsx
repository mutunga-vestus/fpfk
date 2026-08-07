import { useContent } from '../context/ContentContext';

const BACKEND_URL = 'http://localhost:4000';

export default function AboutUs() {
  const { content, loading } = useContent();
  if (loading) return null;
  const { heroImage, title, subtitle, story, beliefs } = content.about;

  return (
    <div>
      <div
        className={`relative min-h-[420px] py-28 flex items-center justify-center text-white overflow-hidden ${
          !heroImage ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950' : 'bg-indigo-950'
        }`}
      >
        {heroImage && (
          // object-cover fills the entire section edge-to-edge (cropping
          // as needed) instead of shrinking to fit, which was leaving
          // large empty indigo bars above/below the photo.
          <img
            src={`${BACKEND_URL}${heroImage}`}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Dark overlay so text stays readable over any photo */}
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
          <p className="font-bold"> Equiping one to touch one for integrity and Mission 
            <br />
          Mark 16:15; And He said unto them, 'Go ye into the all the world and preach the gospel to every creature'
          </p>

          <h2 className="text-xl text-center text-black font-bold uppercase italic mt-12 mb-3">Our Vission</h2>
          <p className="font-bold">
            Let's connect the world to Jesus Christ 
            <br />
            2 chron. 7:15; "Now mine eyes shall be open, and mine ears attentive to the prayer that is made in this place"
          </p>
        </div>
      </div>
    </div>
  );
}