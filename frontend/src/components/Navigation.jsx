import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation - Main navigation bar
 */
function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
            <span className="text-blue-400">🎵</span>
            <span>Mixify</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/mixer"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/mixer')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              🎛️ Mixer
            </Link>
            <Link
              to="/discover"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/discover')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              🔍 Discover
            </Link>
            <Link
              to="/library"
              className={`px-3 py-2 rounded-lg transition ${
                isActive('/library')
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              📚 Library
            </Link>

            {/* User Menu Placeholder */}
            <div className="pl-6 border-l border-gray-700">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition text-white font-medium">
                👤 Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
