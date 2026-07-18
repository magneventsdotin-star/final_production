import React from 'react';

const BaseIcon = ({ children }) => (
  <svg width="100%" height="100%" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    {/* Rich Red Background Circle */}
    <circle cx="70" cy="70" r="56" fill="#C82B1D" />
    
    {/* Subtle Inner Glow */}
    <circle cx="70" cy="70" r="56" fill="url(#circle-glow)" opacity="0.6" />
    
    {/* SVG Defs for gradients */}
    <defs>
      <radialGradient id="circle-glow" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
        <stop offset="0%" stopColor="#ff5e4d" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#8a1a10" stopOpacity="0" />
      </radialGradient>
      
      <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>

    {/* Abstract Silhouette Elements */}
    {children}
  </svg>
);

export const SingerIcon = () => (
  <BaseIcon>
    {/* Accent Shapes */}
    <path d="M 90 25 C 110 35, 120 60, 115 80" stroke="url(#gold-accent)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
    <circle cx="95" cy="40" r="6" fill="url(#gold-accent)" opacity="0.9" />

    {/* Microphone base/stand (Dark) */}
    <path d="M 66 90 L 66 115 L 50 120 L 90 120 L 74 115 L 74 90 Z" fill="#18181B" />
    <path d="M 50 65 A 20 20 0 0 0 90 65 L 94 65 A 24 24 0 0 1 46 65 Z" fill="#18181B" />
    
    {/* Microphone Head */}
    <rect x="55" y="25" width="30" height="46" rx="15" fill="#18181B" />
    
    {/* Grill lines (Gold accent) */}
    <line x1="58" y1="36" x2="82" y2="36" stroke="url(#gold-accent)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="58" y1="46" x2="82" y2="46" stroke="url(#gold-accent)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="58" y1="56" x2="82" y2="56" stroke="url(#gold-accent)" strokeWidth="2.5" strokeLinecap="round" />
  </BaseIcon>
);

export const BandsIcon = () => (
  <BaseIcon>
    <path d="M 30 110 C 20 80, 50 70, 70 85 C 90 100, 100 80, 110 90 C 130 110, 110 130, 85 115 C 60 100, 40 120, 30 110 Z" fill="url(#gold-accent)" opacity="0.15" />
    
    {/* Guitar Body */}
    <path d="M 45 95 C 35 75, 55 65, 65 75 C 75 85, 85 65, 95 75 C 115 95, 105 125, 75 115 C 45 125, 35 115, 45 95 Z" fill="#18181B" />
    {/* Guitar Neck */}
    <rect x="66" y="25" width="12" height="60" fill="#18181B" />
    {/* Headstock */}
    <path d="M 64 12 L 80 12 L 82 25 L 62 25 Z" fill="#18181B" />
    {/* Sound Hole / Accent */}
    <circle cx="72" cy="90" r="12" fill="url(#gold-accent)" />
    {/* Strings */}
    <line x1="70" y1="20" x2="70" y2="105" stroke="#FDE68A" strokeWidth="1.5" />
    <line x1="74" y1="20" x2="74" y2="105" stroke="#FDE68A" strokeWidth="1.5" />
  </BaseIcon>
);

export const DjIcon = () => (
  <BaseIcon>
    {/* Abstract Soundwave bg */}
    <path d="M 20 70 Q 50 20 70 70 T 120 70" stroke="url(#gold-accent)" strokeWidth="4" fill="none" opacity="0.3" strokeLinecap="round" />
    
    {/* Turntable base */}
    <rect x="35" y="85" width="70" height="25" rx="4" fill="#18181B" />
    <circle cx="60" cy="85" r="30" fill="#18181B" />
    <circle cx="60" cy="85" r="10" fill="url(#gold-accent)" />
    
    {/* Tonearm */}
    <path d="M 85 70 L 95 70 L 95 95 L 75 85" stroke="#18181B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    
    {/* Headphones hanging */}
    <path d="M 45 45 A 25 25 0 0 1 95 45" stroke="#18181B" strokeWidth="7" fill="none" strokeLinecap="round" />
    <rect x="40" y="45" width="12" height="22" rx="4" fill="#18181B" />
    <rect x="88" y="45" width="12" height="22" rx="4" fill="#18181B" />
  </BaseIcon>
);

export const ComedianIcon = () => (
  <BaseIcon>
    {/* Mask 1 (Background - shifted) */}
    <path d="M 65 30 C 50 50, 65 95, 85 95 C 105 95, 115 50, 105 30 C 95 20, 75 20, 65 30 Z" fill="url(#gold-accent)" />
    <path d="M 72 45 Q 78 40 82 45" stroke="#18181B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M 88 45 Q 94 40 98 45" stroke="#18181B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M 74 65 Q 85 75 96 65" stroke="#18181B" strokeWidth="4" fill="none" strokeLinecap="round" />
    
    {/* Mask 2 (Foreground) */}
    <path d="M 40 45 C 25 65, 40 110, 60 110 C 80 110, 90 65, 80 45 C 70 35, 50 35, 40 45 Z" fill="#18181B" />
    {/* Eyes */}
    <path d="M 48 60 Q 52 55 56 60" stroke="url(#gold-accent)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M 64 60 Q 68 55 72 60" stroke="url(#gold-accent)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    {/* Laughing Mouth */}
    <path d="M 50 80 Q 60 95 70 80 Z" fill="url(#gold-accent)" />
  </BaseIcon>
);

export const AnchorIcon = () => (
  <BaseIcon>
    {/* Sound waves */}
    <path d="M 110 50 Q 125 75 110 100" stroke="url(#gold-accent)" strokeWidth="5" fill="none" strokeLinecap="round" />
    <path d="M 125 40 Q 145 75 125 110" stroke="url(#gold-accent)" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
    
    {/* Megaphone body */}
    <path d="M 40 75 L 85 45 L 100 52 L 100 98 L 85 105 L 40 85 Z" fill="#18181B" />
    
    {/* Mouthpiece */}
    <rect x="30" y="70" width="12" height="20" rx="3" fill="#18181B" />
    
    {/* Handle */}
    <path d="M 55 85 L 55 115 L 67 115 L 67 92 Z" fill="#18181B" />
  </BaseIcon>
);

export const DancerIcon = () => (
  <BaseIcon>
    {/* Accent stars */}
    <path d="M 95 55 Q 105 55 105 45 Q 105 55 115 55 Q 105 55 105 65 Q 105 55 95 55 Z" fill="url(#gold-accent)" />
    <path d="M 35 95 Q 45 95 45 85 Q 45 95 55 95 Q 45 95 45 105 Q 45 95 35 95 Z" fill="url(#gold-accent)" />
    
    {/* Dynamic abstract body */}
    <circle cx="65" cy="35" r="10" fill="#18181B" />
    <path d="M 65 50 C 80 60, 85 85, 70 105 C 60 120, 50 120, 55 130" stroke="#18181B" strokeWidth="14" fill="none" strokeLinecap="round" />
    <path d="M 65 55 C 45 55, 35 75, 45 95" stroke="#18181B" strokeWidth="12" fill="none" strokeLinecap="round" />
    <path d="M 65 55 C 90 45, 100 30, 90 15" stroke="#18181B" strokeWidth="12" fill="none" strokeLinecap="round" />
  </BaseIcon>
);

export const MagicianIcon = () => (
  <BaseIcon>
    {/* Magic Wand */}
    <path d="M 35 80 L 115 35" stroke="#18181B" strokeWidth="8" strokeLinecap="round" />
    <path d="M 95 45 L 115 35" stroke="url(#gold-accent)" strokeWidth="8" strokeLinecap="round" />
    
    {/* Sparkles */}
    <path d="M 15 45 Q 25 45 25 35 Q 25 45 35 45 Q 25 45 25 55 Q 25 45 15 45 Z" fill="#18181B" />
    <path d="M 105 75 Q 115 75 115 65 Q 115 75 125 75 Q 115 75 115 85 Q 115 75 105 75 Z" fill="url(#gold-accent)" />

    {/* Hat brim */}
    <ellipse cx="70" cy="100" rx="45" ry="12" fill="#18181B" />
    {/* Hat body */}
    <path d="M 45 100 L 50 45 L 90 45 L 95 100 Z" fill="#18181B" />
    {/* Hat band */}
    <rect x="47" y="82" width="46" height="12" fill="url(#gold-accent)" />
  </BaseIcon>
);
