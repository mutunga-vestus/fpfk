import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Home as HomeIcon, Info, Users, Play, Calendar, Phone, Heart, MapPin } from 'lucide-react';
import fpfkLogo from '../assets/fpfk-logo.png';


const navLinks = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/about', label: 'About Us', icon: Info },
  { path: '/visit', label: 'Visit', icon: MapPin },
  { path: '/ministries', label: 'Ministries', icon: Users },
  { path: '/sermons', label: 'Sermons', icon: Play },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/connect', label: 'Connect', icon: Phone },
  { path: '/give', label: 'Give', icon: Heart },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-indigo-950 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={fpfkLogo} alt="FPFK Church Kitengela logo" className="w-10 h-10 rounded-full object-cover" />
            
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive ? 'text-indigo-700 font-medium bg-white shadow-sm' : 'text-indigo-200 hover:text-white hover:bg-white/10'}`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-indigo-200 hover:text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/10 bg-indigo-950">
            <div className="flex flex-col gap-4 px-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 py-3 text-lg font-medium ${isActive ? 'text-white' : 'text-indigo-200 hover:text-white'}`}
                  >
                    <Icon size={22} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
