import { useState, useEffect } from 'react';
import { Leaf, Cpu, Layers, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import Marquee from '../components/Common/Marquee';
import CustomCursor from '../components/Common/CustomCursor';
import Gallery from '../components/Specimen/Gallery';
import InteractiveGlyphs from '../components/Specimen/InteractiveGlyphs';
import SpecimenTester from '../components/Specimen/SpecimenTester';
import ScanHistory from '../components/Specimen/ScanHistory';
import Lenis from 'lenis';

const LOADER_LOGS = [
  'BOOTING TENSORS ENGINE...',
  'RESOLVING BOTANICAL SCHEMAS [LILY, ROSE, SUNFLOWER]...',
  'ESTABLISHING PATHOLOGY GRADIENT CHANNELS...',
  'SYNCHRONIZING WEIGHT VECTOR ENCODERS...',
  'CONNECTING REST API (http://localhost:5000/health)...',
  'COMPUTING Grad-CAM GRADIENTS...',
  'FLORA SCAN OPERATIONAL.'
];

export default function HomePage({ theme, setTheme }) {
  const [cursorText, setCursorText] = useState('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Selected file/preview shared from Gallery preset injection to SpecimenTester
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [selectedName, setSelectedName] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const onHoverStart = (text) => setCursorText(text);
  const onHoverEnd = () => setCursorText('');

  const handleSelectFile = (file, previewUrl, specimenName) => {
    setSelectedFile(file);
    setSelectedPreview(previewUrl);
    setSelectedName(specimenName);
  };

  // Site-wide Loader Progress Interval
  useEffect(() => {
    if (!loading) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      const step = Math.floor(Math.random() * 6) + 4;
      currentProgress = Math.min(currentProgress + step, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [loading]);

  // Lenis Smooth Scroll Initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const loaderLogIndex = Math.min(
    Math.floor((progress / 100) * LOADER_LOGS.length),
    LOADER_LOGS.length - 1
  );
  const currentLoaderLog = LOADER_LOGS[loaderLogIndex];

  // Parallax Scroll Hooks
  const { scrollY } = useScroll();
  const yHeroTitle = useTransform(scrollY, [0, 600], [0, -80]);
  const yHeroSub = useTransform(scrollY, [0, 600], [0, 40]);
  const opacityHero = useTransform(scrollY, [0, 450], [1, 0]);

  // Scroll reveal animation definition
  const scrollReveal = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className={`theme-${theme} min-h-screen flex flex-col relative w-full transition-colors duration-500 overflow-hidden`}>
      {/* Site-wide Fullscreen Boot Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="sys-loader"
            className="fixed inset-0 z-50 flex flex-col justify-between p-8 md:p-12 bg-[#111111] text-[#FBF8F3] select-none font-mono"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Top Log Bar */}
            <div className="flex justify-between items-center text-[10px] tracking-widest font-extrabold uppercase opacity-60">
              <span>FLORA SCAN™ SYSTEM BOOT PROTOCOL</span>
              <span>SYS_STATUS: OPERATIONAL</span>
            </div>

            {/* Center Loading Status */}
            <div className="flex flex-col items-center justify-center my-auto">
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[14vw] font-black leading-none tracking-tighter"
              >
                {progress}%
              </motion.span>
              <div className="h-6 text-[10px] tracking-wider uppercase opacity-60 mt-4 text-center">
                {currentLoaderLog}
              </div>
            </div>

            {/* Bottom Loader Bar */}
            <div className="w-full space-y-4">
              <div className="w-full bg-stone-900 h-[1.5px] rounded-full overflow-hidden">
                <div
                  className="bg-[#D82F2F] h-full transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-end text-[9px] opacity-40 uppercase">
                <span className="max-w-xs leading-normal">
                  INITIALIZING DEEP CONVOLUTIONAL MODEL LAYERS AND BOTANICAL ANATOMY CLASSIFIERS.
                </span>
                <span>SYS_VER_1.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lagging custom cursor */}
      <CustomCursor cursorText={cursorText} />

      {/* Main Navigation Header */}
      <Navbar
        activeTheme={theme}
        setTheme={setTheme}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />

      {/* HERO / TYPOGRAPHIC SPECIMEN SECTION */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={loading ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="swiss-border-b w-full grid grid-cols-1 lg:grid-cols-4 select-none bg-[var(--bg-color)] transition-colors duration-500"
      >
        {/* Giant Typographic Title Card - spans 3 columns */}
        <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 swiss-border-b lg:swiss-border-b-0 lg:swiss-border-r flex flex-col justify-between min-h-[400px] lg:min-h-[500px]">
          <motion.div style={{ y: yHeroTitle, opacity: opacityHero }}>
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={loading ? {} : { y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest flex items-center gap-1.5 mb-6"
            >
              <Layers className="w-3.5 h-3.5" />
              BOTANICAL NEURAL ARCHITECTURE
            </motion.span>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={loading ? {} : { y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12vw] sm:text-[10vw] lg:text-[7.5vw] font-black leading-[0.8] tracking-tighter uppercase mb-4 text-[var(--text-color)]"
            >
              FLORA SCAN
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={loading ? {} : { y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="tech-mono text-[10vw] sm:text-[8vw] lg:text-[6.5vw] font-black theme-text-stroke leading-[0.8] tracking-tighter uppercase"
            >
              RECOGNITION
            </motion.p>
          </motion.div>

          <motion.div style={{ y: yHeroSub, opacity: opacityHero }} className="flex items-end justify-between mt-12">
            <motion.span
              initial={{ opacity: 0 }}
              animate={loading ? {} : { opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="tech-mono text-[11px] font-bold text-theme-muted max-w-sm leading-relaxed uppercase"
            >
              A DEEP LEARNING MODEL SPECIMEN INVESTIGATING SPECIES TAXONOMY AND HEALTH PATHOLOGY.
            </motion.span>

            <div className="animate-bounce p-3 border border-[var(--border-color)] rounded-full hover:bg-[var(--accent-color)] hover:text-white transition-colors duration-300">
              <ArrowDown className="w-4 h-4" />
            </div>
          </motion.div>
        </div>

        {/* Technical Data Card - Spans 1 column */}
        <motion.div style={{ y: yHeroTitle, opacity: opacityHero }} className="p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[300px] lg:min-h-[500px] bg-theme-card">
          <div>
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={loading ? {} : { y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest"
            >
              [ CAPABILITIES ]
            </motion.span>

            <div className="mt-8 space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={loading ? {} : { x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <span className="tech-mono text-[10px] text-theme-muted uppercase font-bold block">SPECIES CLASSIFY</span>
                <p className="text-xl font-bold uppercase tracking-tight mt-1">LILY, ROSE, SUNFLOWER</p>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={loading ? {} : { x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <span className="tech-mono text-[10px] text-theme-muted uppercase font-bold block">PATHOLOGY TEST</span>
                <p className="text-xl font-bold uppercase tracking-tight mt-1">HEALTHY vs DISEASED</p>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={loading ? {} : { x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <span className="tech-mono text-[10px] text-theme-muted uppercase font-bold block">CNN MODEL ACCURACY</span>
                <p className="text-xl font-bold uppercase tracking-tight mt-1">~98.0% HEALTH ACC.</p>
              </motion.div>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-6 flex items-center gap-2 text-[10px] tech-mono text-theme-muted uppercase font-bold">
            <Cpu className="w-4 h-4 text-[var(--accent-color)]" />
            <span>POWERED BY TENSORFLOW</span>
          </div>
        </motion.div>
      </motion.header>

      {/* MARQUEE TEXT TICKER */}
      <Marquee text="FLORA SCAN • SPECIES DETECTION • PLANT PATHOLOGY • DEEP LEARNING MODEL • " />

      {/* CORE SPECIMEN TESTER DIAGNOSTIC AREA */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={scrollReveal}
        id="scanner-section"
      >
        <SpecimenTester
          selectedFile={selectedFile}
          selectedPreview={selectedPreview}
          selectedName={selectedName}
          onSelectFile={handleSelectFile}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          onScanComplete={() => setHistoryRefreshKey((prev) => prev + 1)}
        />
      </motion.div>

      {/* OPERATOR SCAN TELEMETRY & IMAGEKIT CDN ARCHIVE */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={scrollReveal}
        id="telemetry-section"
      >
        <ScanHistory
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
          refreshTrigger={historyRefreshKey}
        />
      </motion.div>

      {/* REVERSE MARQUEE */}
      <Marquee text="LILIACEAE • ROSACEAE • ASTERACEAE • BOTANICAL INTEGRITY • CNN DETECTOR • " reverse={true} />

      {/* BOTANICAL BLUEPRINT GLYPH EXPLORER */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={scrollReveal}
      >
        <InteractiveGlyphs
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      </motion.div>

      {/* BOTANICAL SPECIMEN LIBRARY PRESETS */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={scrollReveal}
        id="presets-section"
      >
        <Gallery
          onSelectSample={handleSelectFile}
          onHoverStart={onHoverStart}
          onHoverEnd={onHoverEnd}
        />
      </motion.div>

      {/* LAYOUT FOOTER */}
      <Footer
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      />
    </div>
  );
}
