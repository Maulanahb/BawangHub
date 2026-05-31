

export const JavaneseFarmerSVG = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0, 5)">
      {/* Baju / Shirt */}
      <path d="M 25 50 L 75 50 L 85 95 L 15 95 Z" fill="#4ade80" stroke="black" strokeWidth="4" strokeLinejoin="round" />
      
      {/* Cangkul (Hoe) - khas petani Indonesia */}
      <line x1="20" y1="20" x2="20" y2="85" stroke="black" strokeWidth="5" strokeLinecap="round" />
      {/* Mata cangkul */}
      <path d="M 12 80 L 28 80 L 26 95 L 14 95 Z" fill="#94a3b8" stroke="black" strokeWidth="3" strokeLinejoin="round" />

      {/* Tangan Kanan pegang Cangkul */}
      <circle cx="20" cy="65" r="7" fill="#fca5a5" stroke="black" strokeWidth="3" />

      {/* Leher & Kepala */}
      <circle cx="50" cy="45" r="14" fill="#fca5a5" stroke="black" strokeWidth="4" />
      
      {/* Wajah (Mata & Senyum) */}
      <path d="M 45 44 L 47 44" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <path d="M 53 44 L 55 44" stroke="black" strokeWidth="3" strokeLinecap="round" />
      <path d="M 45 50 Q 50 55 55 50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />

      {/* Caping (Topi Petani Jawa) */}
      <path d="M 15 35 L 50 5 L 85 35 Z" fill="#fde047" stroke="black" strokeWidth="4" strokeLinejoin="round" />
      {/* Garis anyaman bambu */}
      <path d="M 28 25 L 72 25" stroke="black" strokeWidth="2" strokeLinecap="round" />
      <path d="M 38 16 L 62 16" stroke="black" strokeWidth="2" strokeLinecap="round" />
      
      {/* Tangan Kiri pegang Bawang Merah */}
      <circle cx="80" cy="65" r="7" fill="#fca5a5" stroke="black" strokeWidth="3" />
      {/* Bawang Merah */}
      <path d="M 72 75 C 72 90, 88 90, 88 75 C 88 60, 80 50, 80 50 C 80 50, 72 60, 72 75 Z" fill="#be185d" stroke="black" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M 80 50 Q 75 40 85 45" fill="none" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
    </g>
  </svg>
);

export const BawangMerahSVG = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Bawang Merah Besar */}
    <path d="M 20 65 C 20 95, 80 95, 80 65 C 80 35, 50 15, 50 15 C 50 15, 20 35, 20 65 Z" fill="#9d174d" stroke="black" strokeWidth="5" strokeLinejoin="round" />
    {/* Daun */}
    <path d="M 50 15 Q 40 25 50 45 Q 60 25 50 15 Z" fill="#bef264" stroke="black" strokeWidth="4" strokeLinejoin="round" />
    <path d="M 50 15 Q 30 5 25 25" fill="none" stroke="#65a30d" strokeWidth="4" strokeLinecap="round" />
    <path d="M 50 15 Q 70 5 75 25" fill="none" stroke="#65a30d" strokeWidth="4" strokeLinecap="round" />
    {/* Detail Kulit */}
    <path d="M 35 45 Q 30 70 50 85" fill="none" stroke="#be185d" strokeWidth="4" strokeLinecap="round" />
    <path d="M 65 45 Q 70 70 50 85" fill="none" stroke="#be185d" strokeWidth="4" strokeLinecap="round" />
    {/* Akar */}
    <path d="M 40 90 L 45 98 M 50 92 L 50 99 M 60 90 L 55 98" stroke="black" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
