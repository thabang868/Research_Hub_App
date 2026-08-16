import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateSession = async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const confirmedToken = hash.get('access_token');
      const confirmedRefreshToken = hash.get('refresh_token');

      if (confirmedToken) {
        localStorage.setItem('access_token', confirmedToken);
        if (confirmedRefreshToken) localStorage.setItem('refresh_token', confirmedRefreshToken);
        // Remove credentials from the visible URL and browser history.
        window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
      }

      const token = confirmedToken || localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe(token);
          setUser(data.user);
          setSubscription(data.subscription || null);
      } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const login = (userData, session, sub) => {
    setUser(userData);
    setSubscription(sub || null);
    localStorage.setItem('access_token', session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
  };

  const logout = () => {
    setUser(null);
    setSubscription(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  // Check if subscription is active (not expired)
  const hasActiveSubscription = () => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) return false;
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, subscription, setSubscription, loading, login, logout, hasActiveSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
