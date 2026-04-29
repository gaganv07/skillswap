import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import NotificationsDropdown from './NotificationsDropdown';

function Navbar() {
  const { isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Navbar render - isAuthenticated:', isAuthenticated, 'loading:', loading); // Debug log

  const handleLogout = () => {
    console.log('Navbar logout clicked'); // Debug log
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
    { path: '/requests', label: 'Requests', icon: '📨' },
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50 animate-fade-in-down">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="min-w-0 hover-scale transition-transform duration-200">
          <BrandLogo compact />
        </Link>

        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift hover-scale animate-fade-in-up animate-delay-${(index + 1) * 100} ${
                    location.pathname === item.path
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}

              <NotificationsDropdown />

              <div className="w-px h-6 bg-slate-300 mx-2 animate-fade-in-up animate-delay-500"></div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200 hover-lift hover-scale animate-fade-in-up animate-delay-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 hover-lift hover-scale animate-fade-in-up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all duration-200 hover-lift hover-scale animate-fade-in-up animate-delay-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Animated progress bar for loading states */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-shimmer"></div>
    </header>
  );
}

export default Navbar;
