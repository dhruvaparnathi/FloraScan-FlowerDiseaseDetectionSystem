import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Cpu, User, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '../../Features/Auth/hook/useAuth';

export default function Navbar({ activeTheme, setTheme, onHoverStart, onHoverEnd }) {
  const [backendStatus, setBackendStatus] = useState('checking');
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        if (data.status === 'healthy') {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
        }
      } catch (err) {
        setBackendStatus('disconnected');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const themes = [
    { id: 'cream', label: 'CREAM (01)', bgClass: 'bg-[#FBF8F3] border-stone-800' },
    { id: 'onyx', label: 'ONYX (02)', bgClass: 'bg-[#111111] border-stone-200' },
    { id: 'crimson', label: 'CRIMSON (03)', bgClass: 'bg-[#D82F2F] border-white' },
  ];

  return (
    <nav className="swiss-border-b w-full grid grid-cols-1 md:grid-cols-4 select-none tech-mono text-xs font-medium sticky top-0 bg-[var(--bg-color)] z-40 transition-colors duration-500">
      {/* 1. Title Logo -> Links to / */}
      <Link 
        to="/"
        className="p-5 swiss-border-b md:swiss-border-b-0 md:swiss-border-r flex items-center justify-between group"
        onMouseEnter={() => onHoverStart('FLORA')}
        onMouseLeave={onHoverEnd}
      >
        <span className="font-extrabold text-sm tracking-tight flex items-center gap-2">
          <Cpu className="w-4 h-4 animate-pulse text-[var(--accent-color)]" />
          <span className="group-hover:text-[var(--accent-color)] transition-colors">Flora Scan™</span>
        </span>
        <span className="text-[10px] text-theme-muted bg-theme-tag px-1.5 py-0.5 rounded font-bold">
          V1.0
        </span>
      </Link>

      {/* 2. API Health Status */}
      <div className="p-5 swiss-border-b md:swiss-border-b-0 md:swiss-border-r flex items-center gap-3">
        {backendStatus === 'connected' ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              [ ML_CORE: OPERATIONAL ]
            </span>
          </>
        ) : backendStatus === 'checking' ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-amber-500 font-bold uppercase tracking-wider">
              [ CONNECTING... ]
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
            </span>
            <span className="text-brand-red font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              [ CORE_OFFLINE ]
            </span>
          </>
        )}
      </div>

      {/* 3. Operator Authentication Status -> Links to /login */}
      <div className="p-5 swiss-border-b md:swiss-border-b-0 md:swiss-border-r flex items-center justify-between md:justify-start gap-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5 w-full justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <User className="w-3.5 h-3.5 text-[var(--accent-color)] shrink-0" />
              <span className="text-[11px] font-extrabold uppercase tracking-tight text-[var(--text-color)] truncate">
                OPERATOR: {user.name}
              </span>
            </div>
            <button
              onClick={logout}
              title="Terminate Session"
              onMouseEnter={() => onHoverStart('LOGOUT')}
              onMouseLeave={onHoverEnd}
              className="p-1 rounded border border-[var(--border-color)] hover:border-brand-red hover:bg-brand-red hover:text-white transition-colors duration-200 shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onMouseEnter={() => onHoverStart('LOGIN')}
            onMouseLeave={onHoverEnd}
            className="flex items-center gap-2 border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white px-3 py-1.5 rounded text-[10px] font-bold tracking-wider uppercase transition-all duration-300 w-full md:w-auto justify-center"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>[ ACCESS // LOGIN ]</span>
          </Link>
        )}
      </div>

      {/* 4. Theme Toggles */}
      <div className="p-5 flex items-center justify-between md:justify-end gap-4">
        <span className="text-theme-muted text-[10px] uppercase font-bold tracking-widest hidden sm:inline">
          COLORWAY:
        </span>
        <div className="flex gap-1.5">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              onMouseEnter={() => onHoverStart(t.id)}
              onMouseLeave={onHoverEnd}
              className={`px-2.5 py-1 border text-[10px] font-bold tracking-wider rounded transition-all duration-300 cursor-pointer ${
                activeTheme === t.id
                  ? 'border-[var(--accent-color)] text-[var(--accent-text)] bg-[var(--accent-color)] scale-[1.05]'
                  : 'border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--accent-color)]'
              }`}
            >
              {t.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
