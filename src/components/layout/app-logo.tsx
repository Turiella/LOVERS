
import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      aria-label="Logo de LOVERS"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Simplified mosaic heart */}
      <path 
        d="M50 30 Q20 15, 20 40 T50 70 Q80 55, 80 40 T50 30 Z" 
        fill="url(#grad1)"
      />
      <rect x="25" y="35" width="10" height="10" fill="hsl(var(--background))" opacity="0.5" rx="2"/>
      <rect x="45" y="25" width="10" height="10" fill="hsl(var(--background))" opacity="0.5" rx="2"/>
      <rect x="65" y="35" width="10" height="10" fill="hsl(var(--background))" opacity="0.5" rx="2"/>
      <rect x="35" y="50" width="10" height="10" fill="hsl(var(--background))" opacity="0.5" rx="2"/>
      <rect x="55" y="50" width="10" height="10" fill="hsl(var(--background))" opacity="0.5" rx="2"/>
    </svg>
  );
}
