export function BawangLogo({ className, strokeWidth = 2.5 }: { className?: string, strokeWidth?: number }) {
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
      {/* Background fill */}
      <path d="M12 22A9 9 0 0 0 21 13C21 8 12 2 12 2S3 8 3 13A9 9 0 0 0 12 22Z" fill="currentColor" fillOpacity="0.15" stroke="none" />
      
      {/* Outer Stroke */}
      <path d="M12 22A9 9 0 0 0 21 13C21 8 12 2 12 2S3 8 3 13A9 9 0 0 0 12 22Z" />
      
      {/* Inner Lines */}
      <path d="M12 22C7.5 22 7.5 16 7.5 13C7.5 9 12 2 12 2" />
      <path d="M12 22C16.5 22 16.5 16 16.5 13C16.5 9 12 2 12 2" />
    </svg>
  );
}
