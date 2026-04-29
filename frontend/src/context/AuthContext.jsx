import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage and verify token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Verify that user object has expected fields
            if (parsedUser && typeof parsedUser === 'object') {
              console.log('Found stored auth data, verifying token...');

              // Verify token by calling /auth/me
              try {
                const userData = await authAPI.getMe();
                console.log('Token verified successfully:', userData);
                setToken(storedToken);
                setUser(userData);
              } catch (error) {
                console.error('Token verification failed:', error.message);
                // Token is invalid, clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
            } else {
              // Invalid user data structure
              console.warn('Invalid user data structure in localStorage, clearing auth');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } else {
          console.log('No stored auth data found');
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (userData, accessToken) => {
    console.log('AuthContext.login called with:', { userData: !!userData, accessToken: !!accessToken });

    if (!userData || !accessToken) {
      console.error('AuthContext.login called with missing data:', { userData, accessToken });
      return;
    }

    // Store the user data and token
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('AuthContext state updated:', {
      user: userData?.name || 'unknown',
      token: accessToken.substring(0, 20) + '...',
      isAuthenticated: !!accessToken
    });
  }, []);

  const logout = useCallback(() => {
    console.log('AuthContext.logout called');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('AuthContext state cleared, user logged out');
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = React.useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  }), [user, token, loading, isAuthenticated, login, logout]);

  console.log('AuthContext.Provider render:', { isAuthenticated, loading, hasUser: !!user });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
