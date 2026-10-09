import { Heart, Globe } from 'lucide-react';

function GithubIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Footer({ onHoverStart, onHoverEnd }) {
  return (
    <footer className="swiss-border-t w-full grid grid-cols-1 md:grid-cols-4 tech-mono text-xs select-none transition-colors duration-500 bg-[var(--bg-color)]">
      {/* Editorial Branding */}
      <div className="p-8 swiss-border-b md:swiss-border-b-0 md:swiss-border-r flex flex-col justify-between min-h-[160px]">
        <div>
          <span className="font-extrabold tracking-tight text-sm text-[var(--accent-color)]">
            Flora Scan™
          </span>
          <p className="mt-2 text-theme-muted font-normal leading-relaxed">
            Architectural digital layout built on neo-grotesque design grids. Designed for botanical scanning.
          </p>
        </div>
        <span className="text-[10px] text-theme-muted">© 2026 PP CLASSIFIERS INC.</span>
      </div>

      {/* Database Metrics */}
      <div className="p-8 swiss-border-b md:swiss-border-b-0 md:swiss-border-r flex flex-col justify-between min-h-[160px]">
        <div>
          <span className="font-extrabold tracking-wider text-theme-muted uppercase text-[10px]">
            MODEL CLASSIFICATIONS
          </span>
          <ul className="mt-3 space-y-1.5 font-bold uppercase text-[11px]">
            <li>• SPECIES: LILY, ROSE, SUNFLOWER</li>
            <li>• DIAGNOSIS: HEALTHY, DISEASED</li>
            <li>• INPUT RESOLUTION: 128 X 128 PX</li>
            <li>• TRAINING LOSS: &lt; 0.045</li>
          </ul>
        </div>
        <span className="text-[10px] text-theme-muted">MODEL TYPE: MULTI-TASK CNN</span>
      </div>

      {/* Creative Design Specs */}
      <div className="p-8 swiss-border-b md:swiss-border-b-0 md:swiss-border-r flex flex-col justify-between min-h-[160px]">
        <div>
          <span className="font-extrabold tracking-wider text-theme-muted uppercase text-[10px]">
            CREATIVE SPECIFICATIONS
          </span>
          <p className="mt-3 leading-relaxed text-[11px] font-bold text-theme-muted">
            AESTHETIC STYLE: NEUE MONTREAL SPECIMEN<br />
            PRIMARY COLORWAY: CRIMSON RED (#D82F2F)<br />
            DEVELOPMENT: VITE + REACT + TAILWIND CSS
          </p>
        </div>
        <span className="text-[10px] text-theme-muted flex items-center gap-1">
          BUILT WITH <Heart className="w-3 h-3 text-[var(--accent-color)] fill-current" /> BY BOTANICALS
        </span>
      </div>

      {/* External Repository Links */}
      <div className="p-8 flex flex-col justify-between min-h-[160px]">
        <div>
          <span className="font-extrabold tracking-wider text-theme-muted uppercase text-[10px]">
            DOCUMENT REFERENCE
          </span>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href="https://github.com/dhruvaparnathi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-[var(--accent-color)] font-bold transition-colors duration-300"
              onMouseEnter={() => onHoverStart('GIT')}
              onMouseLeave={onHoverEnd}
            >
              <GithubIcon className="w-4 h-4" />
              GITHUB REPOSITORY
            </a>
            <a
              href="https://neuemontreal.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-[var(--accent-color)] font-bold transition-colors duration-300"
              onMouseEnter={() => onHoverStart('AWARDS')}
              onMouseLeave={onHoverEnd}
            >
              <Globe className="w-4 h-4" />
              INSPIRATION SOURCE
            </a>
          </div>
        </div>
        <span className="text-[10px] text-theme-muted">SPECIMEN NO. PP-938-2</span>
      </div>
    </footer>
  );
}
