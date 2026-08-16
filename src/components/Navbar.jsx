import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ current }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Papers', path: '/search/papers' },
    { label: 'Datasets', path: '/search/datasets' },
    { label: 'Deep Analysis', path: '/deep-analysis' },
    { label: 'AI Assistant', path: '/ai' },
    { label: 'Pricing', path: '/pricing' },
  ];

  return (
    <>
      <nav className="w-full px-4 sm:px-10 lg:px-20 py-4 sm:py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs sm:text-sm">R</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">RHub</span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.filter((l) => l.label !== current).map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="px-3 lg:px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-all cursor-pointer rounded-lg hover:bg-gray-50"
            >
              {link.label}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-1"></div>
          {user && <span className="text-sm text-gray-400 hidden lg:inline mr-1">{user.name}</span>}
          <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer" title="Sign Out">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-9 h-9 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          )}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute top-0 right-0 w-64 h-full bg-white shadow-2xl border-l border-gray-100 flex flex-col animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile menu header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Menu</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-5 py-3 border-b border-gray-50">
                <p className="text-sm font-medium text-gray-900">{user.name} {user.surname}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 py-2">
              {links.map((link) => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setOpen(false); }}
                  className={`w-full text-left px-5 py-3 text-sm transition-all cursor-pointer ${
                    link.label === current
                      ? 'text-gray-900 font-semibold bg-gray-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Sign out */}
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
