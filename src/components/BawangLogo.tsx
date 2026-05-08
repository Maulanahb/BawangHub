export function BawangLogo({ className, strokeWidth = 2 }: { className?: string, strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Daun Bawang (Leaves) */}
      <g stroke="#16a34a" fill="#dcfce7" fillOpacity="0.5">
        <path d="M12 9 C 9 7 7 4 7 2 C 8.5 3.5 10 6 12 9 Z" />
        <path d="M12 9 C 15 7 17 4 17 2 C 15.5 3.5 14 6 12 9 Z" />
        <path d="M12 9 L 11 2 A 1 1 0 0 1 13 2 Z" />
      </g>
      
      {/* Umbi Bawang Merah (Bulb) */}
      <path 
        d="M12 21 C 7 21 4 17.5 4 13.5 C 4 9.5 8 9 12 9 C 16 9 20 9.5 20 13.5 C 20 17.5 17 21 12 21 Z" 
        fill="currentColor" 
        fillOpacity="0.15" 
      />
      
      {/* Serat Dalam (Fibers) */}
      <path d="M12 21 C 9.5 21 8 18 8 13.5 C 8 11.5 9 10 12 9" />
      <path d="M12 21 C 14.5 21 16 18 16 13.5 C 16 11.5 15 10 12 9" />
      
      {/* Akar (Roots) */}
      <path d="M12 21v2" />
      <path d="M9.5 20.5l-1 2" />
      <path d="M14.5 20.5l1 2" />
    </svg>
  );
}
