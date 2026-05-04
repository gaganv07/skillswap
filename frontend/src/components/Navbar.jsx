import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import NotificationsDropdown from './NotificationsDropdown';

const DashboardIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10.5 12 3l9 7.5M5.25 9.75V21h13.5V9.75" />
  </svg>
);

const ExploreIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m21 21-4.35-4.35M10.75 18a7.25 7.25 0 1 1 0-14.5 7.25 7.25 0 0 1 0 14.5Z" />
  </svg>
);

const RequestsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h6m-6 4h10M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 10h10M7 14h6m7-2c0 4.418-3.582 8-8 8a8.96 8.96 0 0 1-3.59-.744L3 20l.744-5.41A8.96 8.96 0 0 1 3 11c0-4.418 3.582-8 8-8s8 3.582 8 8Z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm4.5 13a7.5 7.5 0 0 0-15 0" />
  </svg>
);

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/explore', label: 'Explore', icon: <ExploreIcon /> },
    { path: '/requests', label: 'Requests', icon: <RequestsIcon /> },
    { path: '/chat', label: 'Chat', icon: <ChatIcon /> },
    { path: '/profile', label: 'Profile', icon: <ProfileIcon /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="min-w-0 transition-transform duration-200 hover:scale-[1.01]">
          <BrandLogo compact />
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <nav className="hidden items-center gap-2 lg:flex">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === '/chat' && location.pathname.startsWith('/chat'));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.95)]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden h-7 w-px bg-slate-200 lg:block" />
              <NotificationsDropdown />
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-all duration-200 hover:border-red-200 hover:bg-red-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m15.75 9-3-3m0 0-3 3m3-3v12M5.25 20.25h13.5" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.95)] transition-colors hover:bg-slate-800"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>

      {isAuthenticated && (
        <div className="border-t border-slate-200/70 bg-white/70 px-4 py-2 lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path === '/chat' && location.pathname.startsWith('/chat'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
