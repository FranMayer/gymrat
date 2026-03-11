import type { SVGProps } from 'react';

export function RatAlpha(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Cola */}
        <path
          d="M20 68 C10 60 10 50 22 46"
          stroke="#16a34a"
          strokeWidth="2.2"
        />
        {/* Cuerpo */}
        <ellipse cx="52" cy="60" rx="22" ry="15" fill="#15803d" />
        {/* Pecho marcado */}
        <path
          d="M44 52 C48 48 56 48 60 52"
          stroke="#4ade80"
          strokeWidth="2"
        />
        {/* Cabeza */}
        <circle cx="70" cy="50" r="10" fill="#15803d" />
        {/* Oreja */}
        <circle cx="76" cy="42" r="5" fill="#22c55e" />
        {/* Hocico */}
        <circle cx="80" cy="52" r="2" fill="#bbf7d0" />
        {/* Ojo */}
        <circle cx="68" cy="48" r="1.8" fill="#ecfdf5" />
        {/* Brazos ligeramente marcados */}
        <path d="M50 58 L46 64" stroke="#4ade80" strokeWidth="2.2" />
        <path d="M58 58 L62 64" stroke="#4ade80" strokeWidth="2.2" />
        {/* Piernas */}
        <path d="M48 72 L46 80" stroke="#14532d" strokeWidth="2.2" />
        <path d="M58 72 L60 80" stroke="#14532d" strokeWidth="2.2" />
      </g>
    </svg>
  );
}

