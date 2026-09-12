import { Link } from 'react-router-dom';

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.87.55 9.38.55 9.38.55s7.51 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.6 15.6V8.4l6.4 3.6z" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 text-white mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-2xl">G</div>
            <span className="font-semibold text-2xl">FPFK CHURCH</span>
          </div>
          <p className="text-sm mb-4">A place of worship, community, and transformation.</p>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Follow Us</h4>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/fpfkchurch" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                <InstagramIcon size={18} />
              </a>
              <a href="https://www.facebook.com/fpfkkitengela.township" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                <FacebookIcon size={18} />
              </a>
              <a href="https://www.youtube.com/results?search_query=fpfk+kitengela+township+church" target="_blank" rel="noopener noreferrer" aria-label="Follow us on YouTube" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                <YoutubeIcon size={18} />
              </a>
              <a href="https://www.tiktok.com/@fpfkchurch" target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors">
                <TikTokIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <div className="space-y-2 text-sm">
            <Link to="/about" className="block hover:text-white">About Us</Link>
            <Link to="/sermons" className="block hover:text-white">Sermons</Link>
            <Link to="/events" className="block hover:text-white">Events</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Service Times</h4>
          <div className="space-y-1 text-sm">
            <p>Sunday Morning: 8:00 AM &amp; 1:00 pM</p>
            <p>Wednesday Prayer: 7:00 PM</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <div className="space-y-1 text-sm">
            <p>2500 miriam's road</p>
            <p>Kitengela, ST 12345</p>
            <p>(+254) 7984-87685</p>
            <p>fpfk@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs mt-12 pt-8 border-t border-gray-800">
        © 2026 FPFK Church Kitengela. All rights reserved.
      </div>
    </footer>
  );
}