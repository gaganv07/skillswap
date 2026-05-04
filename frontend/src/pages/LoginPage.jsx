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

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
      const data = await authAPI.login({ email, password });
      login(data.user, data.tokens.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_52%,#0f766e_100%)] p-8 text-white shadow-[0_30px_70px_-40px_rgba(15,23,42,0.95)] sm:p-10">
        <div className="absolute -left-20 top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative space-y-8">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            Welcome Back
          </div>
          <BrandLogo />
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Continue your next skill exchange with clarity and momentum.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/78">
              Log in to review requests, explore new partners, and keep every conversation moving inside one polished workspace.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Professional Profiles', 'Showcase what you teach and what you want to learn.'],
              ['Faster Matches', 'See compatible people and act on requests quickly.'],
              ['Focused Chat', 'Keep conversations organized and ready for collaboration.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card overflow-hidden border-slate-200/80 shadow-[0_28px_60px_-44px_rgba(15,23,42,0.75)]">
        <div className="border-b border-slate-200 bg-white px-8 py-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Account Access</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use your SkillSwap Connect account to enter the dashboard.
          </p>
        </div>

        <div className="bg-white px-8 py-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="form-label">Email</span>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="form-label">Password</span>
              <input
                className="form-input"
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
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.85)] transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Logging in...' : 'Login to your workspace'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-slate-900 transition-colors hover:text-teal-700">
              Create one here
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
