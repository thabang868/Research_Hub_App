import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    // Extract access_token from URL hash (Supabase redirect)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if (token) setAccessToken(token);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.password) {
      return setError('Password is required');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (!accessToken) {
      return setError('Invalid or expired reset link. Please request a new one.');
    }

    setLoading(true);
    try {
      await resetPassword({
        access_token: accessToken,
        new_password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-10 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated</h2>
          <p className="text-gray-500 mb-8">Your password has been reset successfully.</p>
          <button
            onClick={() => navigate('/signin')}
            className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 transition-all cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

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

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create New Password</h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          Enter your new password below
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gray-900 text-white font-medium rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
