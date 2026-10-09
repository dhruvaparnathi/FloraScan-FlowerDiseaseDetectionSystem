import React from 'react';
import { ArrowUpRight, Leaf, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const PRESETS = [
  {
    id: 'rose',
    specimenCode: 'PP-RSE-091',
    name: 'ROSE',
    botanicalName: 'Rosa rubiginosa',
    family: 'ROSACEAE',
    origin: 'Europe & Western Asia',
    path: '/samples/rose.png',
    description: 'Grotesque structure with thorny stems and highly fragrant, multi-layered petals.',
    metrics: { petals: 5, difficulty: 'Medium', water: 'Regular' }
  },
  {
    id: 'sunflower',
    specimenCode: 'PP-SFL-053',
    name: 'SUNFLOWER',
    botanicalName: 'Helianthus annuus',
    family: 'ASTERACEAE',
    origin: 'North America',
    path: '/samples/sunflower.png',
    description: 'Large, towering inflorescence with radiating yellow ray florets tracking solar azimuths.',
    metrics: { petals: 34, difficulty: 'Low', water: 'Moderate' }
  },
  {
    id: 'lily',
    specimenCode: 'PP-LLY-072',
    name: 'LILY',
    botanicalName: 'Lilium candidum',
    family: 'LILIACEAE',
    origin: 'Balkans & Middle East',
    path: '/samples/lily.png',
    description: 'Large, trumpet-shaped white flowers with prominent stamens and delicate architecture.',
    metrics: { petals: 6, difficulty: 'High', water: 'High' }
  },
];

export default function Gallery({ onSelectSample, onHoverStart, onHoverEnd }) {
  const triggerSampleSelect = async (preset) => {
    try {
      const response = await fetch(preset.path);
      const blob = await response.blob();
      const file = new File([blob], `${preset.id}.png`, { type: 'image/png' });
      onSelectSample(file, preset.path, preset.name);
    } catch (error) {
      console.error("Failed to load sample image blob:", error);
    }
  };

  return (
    <section className="w-full swiss-border-b bg-[var(--bg-color)] transition-colors duration-500 py-16 px-6 md:px-12 select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="tech-mono text-xs text-theme-muted font-bold uppercase tracking-widest">[ SPECIMEN_LIBRARY ]</span>
            <h2 className="text-4xl md:text-5xl font-black mt-2 tracking-tighter">
              SUPPORTED SPECIES
            </h2>
          </div>
          <p className="max-w-md text-sm text-theme-muted leading-relaxed font-medium tech-mono">
            Explore default botanical categories. Click any specimen to automatically inject it into the neural diagnostic scanner.
          </p>
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => triggerSampleSelect(preset)}
              onMouseEnter={() => onHoverStart(`SCAN ${preset.name}`)}
              onMouseLeave={onHoverEnd}
              className="swiss-border bg-theme-card hover:bg-theme-card-hover rounded-lg p-6 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:border-[var(--accent-color)]"
            >
              <div>
                {/* Visual Image container with scanning border */}
                <div className="relative aspect-square w-full mb-6 overflow-hidden rounded border border-[var(--border-color)] group-hover:border-[var(--accent-color)] transition-colors duration-300">
                  <img
                    src={preset.path}
                    alt={preset.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                  
                  {/* Holographic scanner effect line */}
                  <div className="absolute left-0 right-0 h-[2px] bg-[var(--accent-color)] opacity-0 group-hover:opacity-100 group-hover:animate-scan z-10 pointer-events-none" />

                  {/* Corner ticks */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/50" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/50" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/50" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/50" />
                </div>

                {/* Info Metadata */}
                <div className="flex justify-between items-start mb-2">
                  <span className="tech-mono text-[10px] text-theme-muted font-bold">
                    {preset.specimenCode}
                  </span>
                  <span className="tech-mono text-[10px] text-[var(--accent-color)] font-bold flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    {preset.family}
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-1 group-hover:text-[var(--accent-color)] transition-colors duration-300">
                  {preset.name}
                </h3>
                
                <p className="tech-mono text-[11px] font-bold text-theme-dim italic mb-4">
                  {preset.botanicalName}
                </p>

                <p className="text-xs text-theme-muted font-normal leading-relaxed line-clamp-3">
                  {preset.description}
                </p>
              </div>

              {/* Bottom Specs Bar */}
              <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex justify-between items-center tech-mono text-[10px] text-theme-muted">
                <span>PETALS: {preset.metrics.petals}</span>
                <span className="flex items-center gap-1 group-hover:text-[var(--accent-color)] transition-colors duration-300 font-bold uppercase">
                  INJECT SPECIMEN
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
