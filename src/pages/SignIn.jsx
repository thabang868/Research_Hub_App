import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      return setError('All fields are required');
    }

    setLoading(true);
    try {
      const data = await signIn(form);
      login(data.user, data.session, data.subscription);
      // Flag for dashboard to show trial welcome toast
      if (data.subscription?.plan === 'free_trial') {
        sessionStorage.setItem('show_trial_toast', '1');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-8 sm:p-10 max-w-md w-full border border-gray-100">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center no-underline">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-tight">
            ResearchHub <span className="text-gray-400 font-light"></span>
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-400 text-center mb-8">Sign in to continue your research</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gray-900 text-white font-medium rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-400 text-center mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-gray-900 font-medium hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
