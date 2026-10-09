import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../hook/useAuth';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    authError,
    setAuthError
  } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset form when modal opens or mode switches
  useEffect(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
    setSuccessMsg('');
    if (setAuthError) setAuthError(null);
  }, [authModalMode, isAuthModalOpen, setAuthError]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (authModalMode === 'register') {
      if (!name.trim()) {
        setLocalError('Operator name is required.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setLocalError('Please enter a valid botanical access email.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Security password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        await register({ name, email, password });
        setSuccessMsg('Operator clearance granted! Logging in...');
      } catch (err) {
        setLocalError(err.message || 'Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Login mode
      if (!email.trim()) {
        setLocalError('Please enter your operator email.');
        return;
      }
      if (!password) {
        setLocalError('Password is required.');
        return;
      }

      setIsSubmitting(true);
      try {
        await login(email, password);
        setSuccessMsg('Session initialized. Welcome back, Operator.');
      } catch (err) {
        setLocalError(err.message || 'Invalid email or password.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[var(--bg-color)] border-2 border-[var(--border-color)] shadow-2xl rounded-lg overflow-hidden z-10 select-none text-[var(--text-color)]"
        >
          {/* Top Decorative Terminal Bar */}
          <div className="p-4 border-b border-[var(--border-color)] bg-theme-card flex items-center justify-between tech-mono text-xs">
            <div className="flex items-center gap-2 font-bold tracking-wider text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
              <span className="uppercase text-theme-muted">
                [ AUTH_TERMINAL // {authModalMode.toUpperCase()} ]
              </span>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1 rounded hover:bg-brand-red hover:text-white transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-b border-[var(--border-color)] tech-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className={`py-3 text-center tracking-wider transition-colors duration-200 ${
                authModalMode === 'login'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-transparent text-theme-muted hover:bg-theme-card'
              }`}
            >
              01 // LOGIN
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              className={`py-3 text-center tracking-wider transition-colors duration-200 ${
                authModalMode === 'register'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-transparent text-theme-muted hover:bg-theme-card'
              }`}
            >
              02 // REGISTER
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-black tracking-tight uppercase">
                {authModalMode === 'login' ? 'OPERATOR LOGIN' : 'NEW CLEARANCE REGISTRATION'}
              </h3>
              <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                {authModalMode === 'login'
                  ? 'Authenticate to access personalized specimen telemetry and diagnosis histories.'
                  : 'Register a new botanical diagnostics clearance profile to log into Flora Scan.'}
              </p>
            </div>

            {/* Error / Alert banner */}
            {(localError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded bg-state-diseased border border-state-diseased text-state-diseased text-xs font-mono flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{localError || authError}</span>
              </motion.div>
            )}

            {/* Success banner */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded bg-state-healthy border border-state-healthy text-state-healthy text-xs font-mono flex items-center gap-2.5"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authModalMode === 'register' && (
                <div>
                  <label className="block tech-mono text-[10px] font-bold uppercase text-theme-muted mb-1.5">
                    OPERATOR NAME
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Jane Goodall"
                      required
                      className="w-full bg-theme-card border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-2.5 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block tech-mono text-[10px] font-bold uppercase text-theme-muted mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@florascan.ai"
                    required
                    className="w-full bg-theme-card border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-2.5 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block tech-mono text-[10px] font-bold uppercase text-theme-muted mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-theme-card border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-2.5 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {authModalMode === 'register' && (
                <div>
                  <label className="block tech-mono text-[10px] font-bold uppercase text-theme-muted mb-1.5">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-theme-card border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-2.5 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-[var(--accent-color)] hover:text-white py-3.5 rounded font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-transparent hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="tech-mono animate-pulse">AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>{authModalMode === 'login' ? 'INITIALIZE SESSION' : 'REGISTER PROFILE'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom quick switch */}
            <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between tech-mono text-[11px]">
              <span className="text-theme-muted">
                {authModalMode === 'login' ? 'Need an operator profile?' : 'Already have credentials?'}
              </span>
              <button
                type="button"
                onClick={() => setAuthModalMode(authModalMode === 'login' ? 'register' : 'login')}
                className="font-bold text-[var(--accent-color)] hover:underline uppercase"
              >
                {authModalMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
