import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute check:', { isAuthenticated, loading });

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900"></div>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
}

export default ProtectedRoute;
