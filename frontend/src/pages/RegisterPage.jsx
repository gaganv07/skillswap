import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        passwordConfirm: confirmPassword,
      });

      login(data.user, data.tokens.accessToken);
      setMessage('Registration successful. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 1400);
    } catch (err) {
      if (err.message?.includes('Email already registered')) {
        setError('This email is already registered. Try signing in instead.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <section className="card overflow-hidden border-slate-200/80 shadow-[0_28px_60px_-44px_rgba(15,23,42,0.75)] lg:order-2">
        <div className="border-b border-slate-200 bg-white px-8 py-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">New Account</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create your profile</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Join the platform and start building meaningful skill exchanges.
          </p>
        </div>

        <div className="bg-white px-8 py-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="form-label">Full Name</span>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </label>

            <label className="block sm:col-span-2">
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
                placeholder="Minimum 6 characters"
                required
                disabled={loading}
              />
            </label>

            <label className="block">
              <span className="form-label">Confirm Password</span>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.85)] transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 transition-colors hover:text-teal-700">
              Sign in here
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(145deg,#ecfeff_0%,#ffffff_48%,#f8fafc_100%)] p-8 shadow-[0_24px_56px_-40px_rgba(15,23,42,0.45)] sm:p-10 lg:order-1">
        <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-teal-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-slate-200 blur-3xl" />
        <div className="relative">
          <BrandLogo />
          <div className="mt-8 space-y-4">
            <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-800">
              Build Your Presence
            </div>
            <h2 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              Launch a profile that feels credible from the first click.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              Add the skills you can teach, the topics you want to learn, and start receiving better quality requests right away.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Professional first impression', 'Structured profiles help other members trust and connect faster.'],
              ['Cleaner matching', 'Your learning goals and strengths stay aligned across the app.'],
              ['More useful requests', 'People know exactly why they should reach out to you.'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white/85 p-4 backdrop-blur">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
