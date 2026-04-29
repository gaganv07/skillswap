import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Email validation regex
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate form
  const validateForm = () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.login({
        email,
        password,
      });

      // Extract token and user data
      const accessToken = data.tokens.accessToken;
      const userData = data.user;

      console.log('Login successful, token:', accessToken); // Debug log
      console.log('User data:', userData); // Debug log

      // Update AuthContext (this will also update localStorage)
      login(userData, accessToken);

      console.log('AuthContext updated, redirecting to dashboard'); // Debug log

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Welcome back</h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
