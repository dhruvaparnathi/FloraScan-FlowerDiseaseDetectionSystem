import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, KeyRound, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../hook/useAuth';
import CustomCursor from '../../../components/Common/CustomCursor';

export default function RegisterPage() {
  const { register, isAuthenticated, authError, setAuthError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cursorText, setCursorText] = useState('');

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    if (setAuthError) setAuthError(null);

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

    setLoading(true);
    try {
      await register({ name, email, password });
      setSuccessMsg('Operator clearance granted! Initializing session...');
      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] flex flex-col justify-between select-none font-mono transition-colors duration-500">
      <CustomCursor cursorText={cursorText} />

      {/* Top Header Bar */}
      <header className="swiss-border-b p-5 flex items-center justify-between bg-[var(--bg-color)]">
        <Link
          to="/"
          onMouseEnter={() => setCursorText('HOME')}
          onMouseLeave={() => setCursorText('')}
          className="flex items-center gap-2 font-extrabold text-sm tracking-tight group"
        >
          <Cpu className="w-4 h-4 text-[var(--accent-color)] animate-pulse" />
          <span className="group-hover:text-[var(--accent-color)] transition-colors">Flora Scan™</span>
          <span className="text-[10px] text-theme-muted bg-theme-tag px-1.5 py-0.5 rounded font-bold">
            V1.0
          </span>
        </Link>

        <Link
          to="/"
          onMouseEnter={() => setCursorText('BACK')}
          onMouseLeave={() => setCursorText('')}
          className="flex items-center gap-1.5 text-xs text-theme-muted hover:text-[var(--accent-color)] font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO SCANNER</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-theme-card border-2 border-[var(--border-color)] rounded-lg shadow-2xl overflow-hidden relative"
        >
          {/* Top Decorative Terminal Bar */}
          <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-color)] flex items-center justify-between text-xs tech-mono">
            <div className="flex items-center gap-2 font-bold tracking-wider text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-ping" />
              <span className="uppercase text-theme-muted">[ NEW_CLEARANCE // ONBOARDING ]</span>
            </div>
            <span className="text-[10px] text-theme-muted font-bold">PORT: 5000</span>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <span className="tech-mono text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-widest block mb-1">
                [ CLEARANCE REGISTRATION ]
              </span>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                SIGN UP
              </h1>
              <p className="text-xs text-theme-muted mt-2 leading-relaxed font-sans">
                Establish a new operator profile to record botanical specimen diagnoses and health pathology telemetry.
              </p>
            </div>

            {/* Error Banner */}
            {(localError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded bg-state-diseased border border-state-diseased text-state-diseased text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{localError || authError}</span>
              </motion.div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3 rounded bg-state-healthy border border-state-healthy text-state-healthy text-xs flex items-center gap-2.5"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block tech-mono text-[10px] font-bold uppercase text-theme-muted mb-1.5">
                  OPERATOR FULL NAME
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Jane Goodall"
                    required
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-3 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

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
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-3 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block tech-mono text-[10px] font-bold uppercase text-theme-muted mb-1.5">
                  SECURITY PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••••• (min 6 characters)"
                    required
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-3 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

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
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--accent-color)] rounded py-3 pl-10 pr-3 text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setCursorText('CREATE')}
                onMouseLeave={() => setCursorText('')}
                className="w-full mt-6 bg-[var(--text-color)] text-[var(--bg-color)] hover:bg-[var(--accent-color)] hover:text-white py-3.5 rounded font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-transparent hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">REGISTERING CLEARANCE...</span>
                ) : (
                  <>
                    <span>REGISTER OPERATOR PROFILE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="text-theme-muted">Already have clearance?</span>
              <Link
                to="/login"
                onMouseEnter={() => setCursorText('LOGIN')}
                onMouseLeave={() => setCursorText('')}
                className="font-bold text-[var(--accent-color)] hover:underline uppercase"
              >
                Sign In Here →
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="swiss-border-t p-5 text-center text-[10px] text-theme-muted uppercase tracking-widest">
        <span>Flora Scan™ Botanical Neural Laboratory // System Active</span>
      </footer>
    </div>
  );
}
