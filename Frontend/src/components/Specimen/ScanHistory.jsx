import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, ExternalLink, ShieldCheck, AlertTriangle, RefreshCw, Layers, Calendar, Lock, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Features/Auth/hook/useAuth';
import scanService from '../../Features/Scans/service/scanService';

export default function ScanHistory({ onHoverStart, onHoverEnd, refreshTrigger }) {
  const { isAuthenticated, token, user } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedScanId, setExpandedScanId] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setScans([]);
      return;
    }

    setLoading(true);
    try {
      const data = await scanService.getHistory(token);
      setScans(data);
    } catch (err) {
      console.warn("Failed to fetch scan history:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const toggleExpand = (id) => {
    setExpandedScanId((prev) => (prev === id ? null : id));
  };

  if (!isAuthenticated) {
    return (
      <section className="w-full swiss-border-b p-8 md:p-16 bg-[var(--bg-color)] select-none tech-mono">
        <div className="max-w-4xl mx-auto border-2 border-dashed border-[var(--border-color)] p-12 text-center rounded-lg bg-theme-card">
          <Lock className="w-8 h-8 text-[var(--accent-color)] mx-auto mb-4" />
          <h3 className="text-xl font-black uppercase tracking-tight">OPERATOR CLOUD ARCHIVE LOCKED</h3>
          <p className="text-xs text-theme-muted mt-2 max-w-md mx-auto">
            Authenticate to view your ImageKit-persisted botanical specimens and real-time Mistral AI neural diagnosis telemetry logs.
          </p>
          <Link
            to="/login"
            onMouseEnter={() => onHoverStart('SIGN IN')}
            onMouseLeave={onHoverEnd}
            className="inline-block mt-6 px-6 py-3 bg-[var(--accent-color)] text-white text-xs font-bold uppercase tracking-wider rounded hover:scale-105 transition-transform"
          >
            SIGN IN TO VIEW TELEMETRY
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full swiss-border-b p-8 md:p-12 lg:p-16 bg-[var(--bg-color)] select-none text-[var(--text-color)] transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <span className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            [ OPERATOR_TELEMETRY // IMAGEKIT_CDN_ARCHIVE ]
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mt-2">
            CLOUD SPECIMEN LOGS
          </h2>
          <p className="text-xs text-theme-muted mt-1 font-sans">
            Authenticated telemetry records for Operator <strong className="text-[var(--accent-color)]">{user?.name}</strong> stored in MongoDB & ImageKit Cloud with Mistral Gen-AI plans.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          onMouseEnter={() => onHoverStart('REFRESH')}
          onMouseLeave={onHoverEnd}
          className="flex items-center gap-2 border border-[var(--border-color)] hover:border-[var(--accent-color)] px-3 py-2 rounded tech-mono text-xs font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>SYNC ARCHIVE</span>
        </button>
      </div>

      {/* Grid of Past Scans */}
      {loading && scans.length === 0 ? (
        <div className="py-16 text-center tech-mono text-xs text-theme-muted animate-pulse">
          CONNECTING TO CLOUD ARCHIVE & RETRIEVING SPECIMENS...
        </div>
      ) : scans.length === 0 ? (
        <div className="py-12 border border-[var(--border-color)] rounded-lg text-center p-8 bg-theme-card">
          <Layers className="w-8 h-8 text-theme-dim mx-auto mb-3" />
          <h4 className="text-sm font-bold uppercase">NO ARCHIVED SPECIMENS FOUND</h4>
          <p className="text-xs text-theme-muted mt-1">
            Feed a flower image into the scanner above to record your first cloud-persisted botanical diagnosis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scans.map((scan) => {
            const isHealthy = scan.health?.toLowerCase() === 'healthy';
            const isExpanded = expandedScanId === scan.id;
            const formattedDate = scan.created_at
              ? new Date(scan.created_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recent';

            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-[var(--border-color)] rounded-lg bg-theme-card overflow-hidden group hover:border-[var(--accent-color)] transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Preview with overlay link */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  {scan.image_url ? (
                    <img
                      src={scan.thumbnail_url || scan.image_url}
                      alt={scan.species}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-theme-muted font-mono">
                      IMAGEKIT BUFFER
                    </div>
                  )}

                  {/* Top Cloud Badge */}
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] tech-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    <span>IMAGEKIT CDN</span>
                  </div>

                  {/* External Link */}
                  {scan.image_url && (
                    <a
                      href={scan.image_url}
                      target="_blank"
                      rel="noreferrer"
                      onMouseEnter={() => onHoverStart('EXPAND')}
                      onMouseLeave={onHoverEnd}
                      className="absolute bottom-2 right-2 bg-black/80 hover:bg-[var(--accent-color)] text-white p-1.5 rounded transition-colors"
                      title="Open full resolution in ImageKit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-4 tech-mono flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 mb-3">
                      <span className="text-lg font-black uppercase tracking-tight">
                        {scan.species}
                      </span>
                      <span className="text-xs font-bold text-[var(--accent-color)]">
                        {(scan.species_confidence * 100).toFixed(0)}% CONF
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-theme-muted text-[10px]">HEALTH STATUS:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isHealthy
                          ? 'bg-state-healthy border border-state-healthy text-state-healthy'
                          : 'bg-state-diseased border border-state-diseased text-state-diseased'
                      }`}>
                        {isHealthy ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {scan.health?.toUpperCase()}
                      </span>
                    </div>

                    {/* AI Plan Toggle */}
                    {scan.treatment_plan && (
                      <div className="my-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(scan.id)}
                          className="w-full text-left p-2 rounded bg-theme-tag border border-[var(--border-color)] hover:border-[var(--accent-color)] flex items-center justify-between text-[10px] font-bold text-[var(--accent-color)] transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Brain className="w-3 h-3 shrink-0 animate-pulse" />
                            <span className="truncate">{scan.treatment_plan.title || 'MISTRAL AI PLAN'}</span>
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 p-3 bg-[var(--bg-color)] border border-[var(--accent-color)]/50 rounded text-[10px] space-y-2 overflow-hidden"
                            >
                              {scan.treatment_plan.summary && (
                                <p className="italic text-theme-muted font-sans text-[11px] leading-tight border-l border-[var(--accent-color)] pl-2">
                                  {scan.treatment_plan.summary}
                                </p>
                              )}
                              <ul className="space-y-1 text-theme-muted font-sans">
                                {scan.treatment_plan.tips?.map((t, idx) => (
                                  <li key={idx} className="flex gap-1.5 items-start">
                                    <span className="text-[var(--accent-color)] font-bold font-mono">0{idx + 1}.</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--border-color)] text-[9px] text-theme-muted flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    <span className="truncate max-w-[100px] text-theme-dim">
                      ID: {scan.id?.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
