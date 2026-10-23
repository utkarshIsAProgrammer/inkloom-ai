import React from 'react';

interface LuxuryLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const LuxuryLogo: React.FC<LuxuryLogoProps> = ({ 
  size = 32, 
  className = "", 
  showText = true 
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Luxury Crest SVG Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-amber-500/30 p-1 shadow-[0_0_20px_rgba(245,158,11,0.15)] group"
        style={{ width: size, height: size }}
      >
        {/* Subtle glowing halo */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-rose-500/20 via-transparent to-amber-500/20 opacity-75 group-hover:opacity-100 transition duration-500" />
        
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          fill="none"
        >
          <defs>
            <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="crestRubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>

          {/* Shield Contour */}
          <path 
            d="M50 8 L86 24 L86 54 Q86 78 50 92 Q14 78 14 54 L14 24 Z" 
            fill="#09090B" 
            stroke="url(#crestGoldGrad)" 
            strokeWidth="3" 
            strokeLinejoin="round"
          />

          {/* Inner Accent Line */}
          <path 
            d="M50 16 L78 28 L78 52 Q78 72 50 84 Q22 72 22 52 L22 28 Z" 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="1" 
            fill="none"
          />

          {/* Central Monogram */}
          <path d="M50 24 L50 76" stroke="url(#crestGoldGrad)" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M36 34 L64 34" stroke="url(#crestGoldGrad)" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 66 L66 66" stroke="url(#crestGoldGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Ruby Core Jewel */}
          <polygon points="50,42 58,50 50,58 42,50" fill="url(#crestRubyGrad)" />
          <circle cx="50" cy="50" r="2" fill="#FFFFFF" />

          {/* Golden Cardinal Points */}
          <circle cx="50" cy="24" r="2.5" fill="#FCD34D" />
          <circle cx="50" cy="76" r="2.5" fill="#FCD34D" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-syne font-black text-lg tracking-tight text-white uppercase">
              INKLOOM<span className="text-rose-500">.</span><span className="text-amber-400 font-mono text-sm">AI</span>
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-semibold mt-1">
            Autonomous Brand Governance
          </span>
        </div>
      )}
    </div>
  );
};
