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

  // Email validation regex
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate form
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

      // Extract token and user data
      const accessToken = data.tokens.accessToken;
      const userData = data.user;

      console.log('Registration successful, token:', accessToken); // Debug log

      // Update AuthContext (this will also update localStorage)
      login(userData, accessToken);

      setMessage('Registration successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Registration error:', err);

      // Handle specific error messages
      if (err.message?.includes('Email already registered')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (err.message?.includes('Validation error')) {
        setError('Please check your input and try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
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
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create an account</h1>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Full Name</span>
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </label>

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
              placeholder="Min 6 characters"
              required
              disabled={loading}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Confirm Password</span>
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-900 focus:outline-none"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
