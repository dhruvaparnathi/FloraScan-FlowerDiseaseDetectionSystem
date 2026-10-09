import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Eye, Info } from 'lucide-react';

const NODES = [
  {
    id: 'petals',
    label: 'PETAL GEOMETRY (01)',
    cx: '50%',
    cy: '30%',
    title: 'CHROMATIC & CURVATURE SEGMENTATION',
    desc: 'The model parses convolutional layers to identify petal edges, aspect ratios, and pigment gradients. These details isolate Liliaceae from Rosaceae structures.'
  },
  {
    id: 'foliage',
    label: 'FOLIAGE PATHOLOGY (02)',
    cx: '75%',
    cy: '65%',
    title: 'CHLOROSIS & LESION MAPPING',
    desc: 'Leaves house primary disease vectors. The CNN scrutinizes pixels for localized black spots, powdery mildew coatings, and vein discoloration.'
  },
  {
    id: 'stem',
    label: 'STEM ANATOMY (03)',
    cx: '45%',
    cy: '75%',
    title: 'STRUCTURAL INTEGRITY ANALYSIS',
    desc: 'Examines thickness and texture markers. Helps cross-reference the botanical framework and supports vascular health calculations.'
  },
  {
    id: 'pistil',
    label: 'REPRODUCTIVE CORE (04)',
    cx: '51%',
    cy: '46%',
    title: 'TAXONOMICAL ANCHORING',
    desc: 'The pistil and stamens form the biological anchor of flower species. The model relies heavily on center textures to verify high-confidence species outputs.'
  }
];

export default function InteractiveGlyphs({ onHoverStart, onHoverEnd }) {
  const [activeNode, setActiveNode] = useState(NODES[0]);

  return (
    <section className="w-full swiss-border-b grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-color)] transition-colors duration-500 min-h-[600px] select-none">
      {/* Left Panel: SVG Botanical Blueprint */}
      <div className="p-8 md:p-12 lg:p-16 swiss-border-b lg:swiss-border-b-0 lg:swiss-border-r flex flex-col justify-between relative min-h-[400px] lg:min-h-0">
        <div>
          <span className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest">[ BOTANICAL_BLUEPRINT ]</span>
          <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tighter">
            MODEL ANATOMY
          </h2>
          <p className="mt-4 text-sm text-theme-muted leading-relaxed max-w-md">
            Click or hover the interactive nodes to inspect how the Convolutional Neural Network segmentally parses flower anatomical regions.
          </p>
        </div>

        {/* Interactive SVG Diagram */}
        <div className="my-8 flex justify-center items-center relative h-[300px]">
          <svg className="w-64 h-64 text-theme-dim" viewBox="0 0 100 100" fill="none">
            {/* Stem */}
            <path d="M50,50 Q45,75 48,95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            {/* Leaf Left */}
            <path d="M47,70 Q28,65 47,80 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            {/* Leaf Right */}
            <path d="M48,77 Q70,70 51,85 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            {/* Flower Petals */}
            <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="34" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="66" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="34" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="50" cy="66" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="39" cy="39" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="61" cy="39" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="39" cy="61" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="61" cy="61" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
            {/* Center Core */}
            <circle cx="50" cy="50" r="6" fill="currentColor" className="text-theme-muted" />
          </svg>

          {/* Interactive node overlays */}
          {NODES.map((node) => {
            const isActive = activeNode.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(node)}
                onMouseEnter={() => {
                  setActiveNode(node);
                  onHoverStart(`ANATOMY: ${node.id.toUpperCase()}`);
                }}
                onMouseLeave={onHoverEnd}
                style={{ left: node.cx, top: node.cy }}
                className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group focus:outline-none"
              >
                {/* Glowing ring */}
                <span className={`absolute inset-0 rounded-full bg-[var(--accent-color)] opacity-20 group-hover:scale-150 transition-transform duration-300 ${
                  isActive ? 'animate-ping opacity-30' : ''
                }`} />
                <span className={`w-2.5 h-2.5 rounded-full border border-[var(--text-color)] transition-all duration-300 ${
                  isActive ? 'bg-[var(--accent-color)] scale-125' : 'bg-theme-muted group-hover:bg-[var(--accent-color)]'
                }`} />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-theme-muted font-bold tech-mono text-[10px]">
          <Eye className="w-3.5 h-3.5" />
          <span>ACTIVE TARGET: {activeNode.label}</span>
        </div>
      </div>

      {/* Right Panel: Monospaced Swiss Specifications Readout */}
      <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[400px] lg:min-h-0 bg-theme-card">
        <div>
          <span className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest">[ COMPONENT_SPECS ]</span>
          <div className="mt-8 border-t border-[var(--border-color)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="py-6"
              >
                <span className="tech-mono text-xs font-bold text-[var(--accent-color)]">
                  {activeNode.label}
                </span>
                
                <h3 className="text-2xl md:text-3xl font-black mt-2 leading-tight tracking-tighter">
                  {activeNode.title}
                </h3>
                
                <p className="mt-6 text-sm text-theme-muted font-normal leading-relaxed">
                  {activeNode.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Feature Specs Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-6 tech-mono text-[10px] text-theme-muted">
          <div>
            <span className="font-bold text-theme-dim uppercase">CLASSIFICATION MATRIX:</span>
            <p className="mt-1 font-bold text-[var(--text-color)] text-xs">GRADIENT-WEIGHTED CLASS (Grad-CAM)</p>
          </div>
          <div>
            <span className="font-bold text-theme-dim uppercase">ANALYSIS DEPTH:</span>
            <p className="mt-1 font-bold text-[var(--text-color)] text-xs">50 LAYER RESNET BACKBONE</p>
          </div>
        </div>
      </div>
    </section>
  );
}
