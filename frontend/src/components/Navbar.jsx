import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Info, Users, Play, Calendar, Heart } from 'lucide-react';
import fpfkLogo from '../assets/fpfk-logo.png';

const navLinks = [
  { path: '/about', label: 'About', icon: Info },
  { path: '/ministries', label: 'Ministries', icon: Users },
  { path: '/sermons', label: 'Sermons', icon: Play },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/give', label: 'Give', icon: Heart },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-brand-dark shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={fpfkLogo}
              alt="FPFK Church Kitengela logo"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-xl text-white">FPFK CHURCH</div>
              <div className="text-xs text-brand-soft -mt-1">Kitengela</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-brand font-medium'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}

            {/* Plan a Visit button */}
            <Link
              to="/connect"
              className="ml-2 px-5 py-2.5 bg-brand hover:bg-brand-deep text-white text-sm font-semibold rounded-full transition-colors shadow-md shadow-brand/20"
            >
              Plan a Visit
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                      isActive
                        ? 'text-brand bg-white/5'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}

              <Link
                to="/connect"
                onClick={() => setIsMenuOpen(false)}
                className="mt-3 mx-4 text-center px-5 py-3 bg-brand hover:bg-brand-deep text-white font-semibold rounded-full transition-colors"
              >
                Plan a Visit
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}