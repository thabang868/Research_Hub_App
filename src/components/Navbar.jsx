import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProfileDetails({ user, subscription, remainingTime, onPricing, onLogout }) {
  const planNames = {
    free_trial: 'Free Trial',
    daily: 'Daily Plan',
    monthly: 'Monthly Plan',
    unlimited: 'Unlimited Plan',
  };

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{user?.name} {user?.surname}</p>
        <p className="text-xs text-gray-400 mt-0.5 break-all">{user?.email}</p>
      </div>
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-400">Current plan</span>
          <span className="font-semibold text-gray-800">{planNames[subscription?.plan] || 'No active plan'}</span>
        </div>
        {subscription && (
          <div className="flex items-start justify-between gap-4 text-xs">
            <span className="text-gray-400">Remaining</span>
            <span className={`font-mono font-semibold text-right ${remainingTime === '00h 00m 00s' ? 'text-red-600' : 'text-gray-800'}`} aria-live="polite">
              {remainingTime}
            </span>
          </div>
        )}
      </div>
      <div className="p-2">
        <button onClick={onPricing} className="w-full text-left px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 cursor-pointer">
          View or change plan
        </button>
        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 cursor-pointer">
          Sign Out
        </button>
      </div>
    </>
  );
}

export default function Navbar({ current }) {
  const { user, subscription, logout, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(0);
  const profileRef = useRef(null);
  const expiryRefreshRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeProfile = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeProfile);
    return () => document.removeEventListener('mousedown', closeProfile);
  }, []);

  useEffect(() => {
    if (!subscription?.expires_at || !now) return;
    if (new Date(subscription.expires_at).getTime() <= now && expiryRefreshRef.current !== subscription.expires_at) {
      expiryRefreshRef.current = subscription.expires_at;
      refreshSubscription();
    }
  }, [now, subscription?.expires_at, refreshSubscription]);

  const remainingTime = (() => {
    if (subscription?.plan === 'unlimited' || !subscription?.expires_at) return 'No time limit';
    if (!now) return 'Calculating...';
    const remaining = Math.max(0, new Date(subscription.expires_at).getTime() - now);
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  })();

  const handlePricing = () => { navigate('/pricing'); setProfileOpen(false); setOpen(false); };
  const toggleProfile = () => {
    setProfileOpen((value) => !value);
    if (!profileOpen) refreshSubscription();
  };

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
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all cursor-pointer"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span>{user.name}</span>
                <svg className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden" role="menu">
                  <ProfileDetails user={user} subscription={subscription} remainingTime={remainingTime} onPricing={handlePricing} onLogout={handleLogout} />
                </div>
              )}
            </div>
          )}
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

            {/* User profile */}
            {user && (
              <div className="border-b border-gray-100">
                <button onClick={toggleProfile} className="w-full px-5 py-3 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name} {user.surname}</p>
                    <p className="text-xs text-gray-400">View profile and plan</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {profileOpen && <div className="bg-gray-50/50"><ProfileDetails user={user} subscription={subscription} remainingTime={remainingTime} onPricing={handlePricing} onLogout={handleLogout} /></div>}
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

          </div>
        </div>
      )}
    </>
  );
}
