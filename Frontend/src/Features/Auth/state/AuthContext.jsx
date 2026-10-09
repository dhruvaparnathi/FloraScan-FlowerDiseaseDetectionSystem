/**
 * Authentication Context & State Provider
 * ========================================
 * Provides global state for user session, active token,
 * authentication methods, and global AuthModal controls.
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../service/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Global Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Verify and sync stored session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const profile = await authService.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch {
          // Token expired or invalid
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    }
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    setAuthError(null);
    try {
      const data = await authService.register({ name, email, password, role });
      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setAuthError(null);
  }, []);

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
