import { useState, useRef, useEffect } from 'react';
import { Upload, Sliders, Play, RotateCcw, AlertTriangle, ShieldCheck, HelpCircle, Lock, Cloud, ExternalLink, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../../Features/Auth/hook/useAuth';
import scanService from '../../Features/Scans/service/scanService';

const LOG_STEPS = [
  'INITIALIZING TENSORENGINES...',
  'AUTHENTICATING OPERATOR BEARER CREDENTIALS...',
  'CONNECTING TO CORE_HEALTH_MODEL...',
  'CONNECTING TO CORE_SPECIES_MODEL...',
  'UPLOADING SPECIMEN BLOB TO IMAGEKIT CDN...',
  'INVOKING MISTRAL AI BOTANICAL COPILOT (PIXTRAL-12B)...',
  'SYNTHESIZING GEN-AI PATHOLOGY TREATMENT PLAN...',
  'PERSISTING TELEMETRY TO MONGODB...',
  'DIAGNOSIS REVEALED.'
];

export default function SpecimenTester({ selectedFile, selectedPreview, selectedName, onSelectFile, onHoverStart, onHoverEnd, onScanComplete }) {
  const { isAuthenticated, token, user } = useAuth();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gridOverlay, setGridOverlay] = useState(true);
  const [scanSpeed, setScanSpeed] = useState(220); // ms per log step
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Sync sample selections from parent
  useEffect(() => {
    if (selectedFile) {
      setResult(null);
      setError(null);
    }
  }, [selectedFile]);

  // Handle Drag and Drop events
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = URL.createObjectURL(file);
      onSelectFile(file, url, '');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      onSelectFile(file, url, '');
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  const resetScanner = () => {
    onSelectFile(null, null, '');
    setResult(null);
    setError(null);
    setScanning(false);
    setScanStep(0);
  };

  const runNeuralDiagnosis = async () => {
    if (!selectedFile) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setScanning(true);
    setResult(null);
    setError(null);
    setScanStep(0);

    // Dynamic terminal log steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < LOG_STEPS.length) {
        setScanStep(currentStep);
      } else {
        clearInterval(interval);
      }
    }, scanSpeed);

    try {
      // Perform authorized fetch to Flask Backend with ImageKit + Mistral AI + Mongo
      const data = await scanService.uploadAndDiagnose(selectedFile, token);

      setTimeout(() => {
        setResult({
          ...data,
          source: 'backend'
        });
        setScanning(false);
        if (data.health && data.health.toLowerCase() === 'healthy') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
        if (onScanComplete) {
          onScanComplete();
        }
      }, Math.max(0, (LOG_STEPS.length - currentStep) * scanSpeed));

    } catch (err) {
      console.warn("Backend inference error:", err);
      setError(err.message || 'Diagnosis failed. Please check server connection.');
      setScanning(false);
    }
  };

  return (
    <section className="w-full swiss-border-b grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-color)] transition-colors duration-500 select-none">
      {/* LEFT PANEL: UPLOAD AND SCAN ADJUSTMENTS */}
      <div className="p-8 md:p-12 lg:p-16 swiss-border-b lg:swiss-border-b-0 lg:swiss-border-r flex flex-col justify-between min-h-[500px]">
        <div>
          <span className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest">[ DIAGNOSTIC_SCANNER ]</span>
          <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tighter">
            SPECIMEN INPUT
          </h2>
          <p className="mt-4 text-sm text-theme-muted leading-relaxed max-w-md">
            Feed a flower specimen image to run real-time botanical classification, ImageKit cloud storage, and Mistral Generative AI treatment synthesis.
          </p>
        </div>

        {/* DRAG & DROP ZONE */}
        <div className="my-8">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedPreview ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerUpload}
              onMouseEnter={() => onHoverStart('BROWSE')}
              onMouseLeave={onHoverEnd}
              className="swiss-border border-dashed border-2 rounded-lg cursor-pointer bg-theme-card hover:bg-theme-card-hover p-12 transition-all duration-300 flex flex-col items-center justify-center text-center relative min-h-[260px] group hover:border-[var(--accent-color)]"
            >
              {/* Corner ticks */}
              <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors" />
              <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors" />
              <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors" />
              <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors" />

              <Upload className="w-10 h-10 text-theme-dim group-hover:text-[var(--accent-color)] group-hover:scale-110 transition-all duration-300 mb-4" />
              <span className="font-extrabold text-sm uppercase tracking-wide">
                UPLOAD BOTANICAL SPECIMEN
              </span>
              <span className="tech-mono text-[10px] text-theme-muted mt-2">
                DRAG & DROP IMAGE OR CLICK TO SELECT FILE
              </span>
            </div>
          ) : (
            <div className="swiss-border rounded-lg overflow-hidden relative aspect-video bg-black flex items-center justify-center group border-[var(--accent-color)]">
              {/* Image Preview with Custom Zoom */}
              <img
                src={selectedPreview}
                alt="Preview"
                style={{ transform: `scale(${zoomLevel})` }}
                className={`w-full h-full object-cover transition-transform duration-300 ${scanning ? 'brightness-50' : ''
                  }`}
              />

              {/* Grid Lines Overlay */}
              {gridOverlay && (
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
              )}

              {/* Custom scanning animation line */}
              {scanning && (
                <div className="absolute left-0 right-0 h-[2px] bg-[var(--accent-color)] animate-scan shadow-[0_0_8px_var(--accent-color)] z-10" />
              )}

              {/* Interactive Info overlay in bottom left */}
              <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-1 rounded text-[9px] tech-mono text-stone-300 pointer-events-none uppercase border border-white/10">
                ZOOM: {zoomLevel.toFixed(1)}X | GRID: {gridOverlay ? 'ON' : 'OFF'}
              </div>

              {/* Delete / Clear button */}
              {!scanning && (
                <button
                  onClick={resetScanner}
                  onMouseEnter={() => onHoverStart('CLEAR')}
                  onMouseLeave={onHoverEnd}
                  className="absolute top-3 right-3 bg-black/80 hover:bg-brand-red text-white p-2 rounded transition-colors duration-300 border border-white/10 focus:outline-none cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* INPUT CONTROLS / SLIDERS */}
        {selectedPreview && !scanning && (
          <div className="space-y-4 border-t border-[var(--border-color)] pt-6 tech-mono text-xs text-theme-muted select-none">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold uppercase text-[10px]"><Sliders className="w-3.5 h-3.5" /> ZOOM ADJ:</span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-32 accent-[var(--accent-color)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px]">GRID ALIGNMENT:</span>
              <button
                onClick={() => setGridOverlay(!gridOverlay)}
                className={`px-3 py-1 rounded border text-[9px] font-bold transition-all cursor-pointer ${gridOverlay
                  ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10'
                  : 'border-[var(--border-color)] text-[var(--text-color)]'
                  }`}
              >
                {gridOverlay ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px]">SCAN SPEED:</span>
              <div className="flex gap-2">
                {[100, 200, 400].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setScanSpeed(speed)}
                    className={`px-2 py-1 rounded border text-[9px] font-bold transition-all cursor-pointer ${scanSpeed === speed
                      ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/10'
                      : 'border-[var(--border-color)] text-[var(--text-color)]'
                      }`}
                  >
                    {speed === 100 ? 'FAST' : speed === 200 ? 'NORMAL' : 'DETAILED'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Protected with Auth */}
        {selectedPreview && !scanning && (
          <div>
            {!isAuthenticated ? (
              <div className="mt-6 p-4 rounded bg-theme-card border border-[var(--border-color)] text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-[var(--accent-color)] tech-mono text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  <span>[ OPERATOR ACCESS REQUIRED ]</span>
                </div>
                <p className="text-xs text-theme-muted">
                  You must sign in to execute deep convolutional neural diagnosis, cloud archiving, and Mistral Gen-AI treatment synthesis.
                </p>
                <Link
                  to="/login"
                  onMouseEnter={() => onHoverStart('SIGN IN')}
                  onMouseLeave={onHoverEnd}
                  className="w-full bg-[var(--accent-color)] text-white py-3 rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform block"
                >
                  SIGN IN TO RUN DIAGNOSIS
                </Link>
              </div>
            ) : (
              <button
                onClick={runNeuralDiagnosis}
                onMouseEnter={() => onHoverStart('RUN DIAGNOSIS')}
                onMouseLeave={onHoverEnd}
                className="w-full mt-6 bg-[var(--text-color)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--bg-color)] py-4 rounded font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-transparent hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                RUN NEURAL DIAGNOSIS (OPERATOR: {user?.name})
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: TECHNICAL DIAGNOSTICS READOUT */}
      <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[500px] bg-theme-card">
        <div>
          <span className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest">[ DIAGNOSIS_READOUT ]</span>

          <div className="mt-8 border-t border-[var(--border-color)] flex-grow">
            <AnimatePresence mode="wait">
              {/* STATE 1: Empty Screen before upload */}
              {!selectedPreview && !scanning && !result && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center text-theme-muted"
                >
                  <HelpCircle className="w-12 h-12 text-theme-dim mb-4 animate-bounce" />
                  <p className="text-sm font-medium leading-relaxed max-w-sm">
                    No active botanical target detected. Feed a sample specimen to activate core tensor layers and Mistral AI copilot.
                  </p>
                </motion.div>
              )}

              {/* Error Screen */}
              {error && !scanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center text-state-diseased"
                >
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
                  <p className="text-xs font-mono">{error}</p>
                </motion.div>
              )}

              {/* STATE 2: Scanning Terminal log */}
              {scanning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-6 font-mono text-[11px] leading-relaxed text-[var(--text-color)] space-y-1.5 select-text"
                >
                  {LOG_STEPS.slice(0, scanStep + 1).map((log, i) => (
                    <div key={i} className={i === scanStep ? 'text-[var(--accent-color)] font-bold animate-pulse' : 'text-theme-muted'}>
                      &gt; {log}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* STATE 3: Classification Result card */}
              {result && !scanning && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
                  className="py-6"
                >
                  {/* Cloud Storage CDN Info Badge */}
                  {result.image_url && (
                    <div className="bg-theme-tag border border-[var(--border-color)] p-3 rounded mb-6 text-[10px] tech-mono flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                        <Cloud className="w-3.5 h-3.5" />
                        IMAGEKIT CLOUD ARCHIVED
                      </span>
                      <a
                        href={result.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent-color)] hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>VIEW CDN ASSET</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Species Heading */}
                  <div className="flex justify-between items-baseline mb-2 border-b border-[var(--border-color)] pb-3">
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
                      {result.species.toUpperCase()}
                    </h3>
                    <span className="tech-mono text-sm font-black text-[var(--accent-color)]">
                      {(result.species_confidence * 100).toFixed(1)}% CONF.
                    </span>
                  </div>

                  {/* Custom Confidence meter */}
                  <div className="w-full bg-theme-tag h-[3px] rounded-full overflow-hidden mb-6">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.species_confidence * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="bg-[var(--accent-color)] h-full"
                    />
                  </div>

                  {/* Health status details block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Status Box */}
                    <div className={`p-4 border rounded ${result.health.toLowerCase() === 'healthy'
                      ? 'bg-state-healthy border-state-healthy text-state-healthy'
                      : 'bg-state-diseased border-state-diseased text-state-diseased'
                      }`}>
                      <span className="tech-mono text-[9px] font-bold block uppercase opacity-70">BOTANICAL HEALTH:</span>
                      <span className="text-2xl font-black tracking-tight mt-1 flex items-center gap-1.5">
                        {result.health.toLowerCase() === 'healthy' ? (
                          <>
                            <ShieldCheck className="w-6 h-6 fill-current opacity-20" />
                            HEALTHY
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-6 h-6 fill-current opacity-20" />
                            DISEASED
                          </>
                        )}
                      </span>
                    </div>

                    {/* Confidence Box */}
                    <div className="p-4 border border-[var(--border-color)] rounded">
                      <span className="tech-mono text-[9px] font-bold block uppercase text-theme-muted">DIAGNOSIS ACCURACY:</span>
                      <span className="text-2xl font-black tracking-tight mt-1 text-[var(--text-color)]">
                        {(result.health_confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Probability Breakdown Bar (Matching Streamlit Logic) */}
                  <div className="p-4 border border-[var(--border-color)] rounded mb-6 bg-[var(--bg-card)]">
                    <span className="tech-mono text-[9px] font-bold block uppercase text-theme-muted mb-2">PROBABILITY BREAKDOWN:</span>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold tech-mono mb-1">
                          <span className="text-emerald-500">HEALTHY</span>
                          <span className="text-emerald-500">
                            {((result.healthy_prob ?? (result.health?.toLowerCase() === 'healthy' ? result.health_confidence : 1 - result.health_confidence)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--border-color)] h-2 rounded overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-700" 
                            style={{ width: `${(result.healthy_prob ?? (result.health?.toLowerCase() === 'healthy' ? result.health_confidence : 1 - result.health_confidence)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold tech-mono mb-1">
                          <span className="text-rose-500">DISEASED</span>
                          <span className="text-rose-500">
                            {((result.diseased_prob ?? (result.health?.toLowerCase() === 'diseased' ? result.health_confidence : 1 - result.health_confidence)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-[var(--border-color)] h-2 rounded overflow-hidden">
                          <div 
                            className="bg-rose-500 h-full transition-all duration-700" 
                            style={{ width: `${(result.diseased_prob ?? (result.health?.toLowerCase() === 'diseased' ? result.health_confidence : 1 - result.health_confidence)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generative AI Treatment Plan Section */}
                  {result.treatment_plan && (
                    <div className="border-2 border-[var(--accent-color)] rounded-lg p-5 bg-[var(--bg-color)] shadow-lg relative overflow-hidden">
                      {/* Top AI badge */}
                      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-3">
                        <div className="flex items-center gap-1.5 text-[var(--accent-color)] tech-mono text-[10px] font-extrabold tracking-wider">
                          <Brain className="w-4 h-4 animate-pulse" />
                          <span>[ MISTRAL AI BOTANICAL COPILOT ]</span>
                        </div>
                        <span className="text-[9px] tech-mono font-bold bg-theme-tag px-2 py-0.5 rounded text-theme-muted">
                          {result.treatment_plan.ai_model || 'Mistral AI'}
                        </span>
                      </div>

                      {/* Plan Title */}
                      <h4 className="text-sm font-black text-[var(--text-color)] uppercase tracking-tight mb-2">
                        {result.treatment_plan.title}
                      </h4>

                      {/* Summary */}
                      {result.treatment_plan.summary && (
                        <p className="text-xs text-theme-muted mb-4 font-sans leading-relaxed italic border-l-2 border-[var(--accent-color)] pl-3">
                          "{result.treatment_plan.summary}"
                        </p>
                      )}

                      {/* Actionable Tips */}
                      {result.treatment_plan.tips && result.treatment_plan.tips.length > 0 && (
                        <div>
                          <span className="tech-mono text-[9px] font-bold text-theme-dim uppercase block mb-2">
                            ACTIONABLE HORTICULTURAL PROTOCOL:
                          </span>
                          <ul className="space-y-2.5 text-xs text-[var(--text-color)] font-normal leading-relaxed">
                            {result.treatment_plan.tips.map((tip, i) => (
                              <li key={i} className="flex gap-2.5 items-start">
                                <span className="tech-mono text-[10px] font-extrabold text-[var(--accent-color)] bg-theme-tag w-5 h-5 rounded flex items-center justify-center shrink-0">
                                  0{i + 1}
                                </span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid-based bottom stats summary */}
        <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-6 tech-mono text-[10px] text-theme-muted select-none">
          <div>
            <span className="font-bold text-theme-dim uppercase">GEN-AI COPILOT:</span>
            <p className="mt-1 font-bold text-[var(--text-color)] text-xs">MISTRAL AI (PIXTRAL-12B)</p>
          </div>
          <div>
            <span className="font-bold text-theme-dim uppercase">STORAGE CDN:</span>
            <p className="mt-1 font-bold text-[var(--text-color)] text-xs">IMAGEKIT CLOUD</p>
          </div>
        </div>
      </div>
    </section>
  );
}
