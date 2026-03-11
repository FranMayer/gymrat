import type { SVGProps } from 'react';

export function RatWar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Cola en látigo */}
        <path
          d="M18 70 C6 60 8 44 24 40"
          stroke="#c2410c"
          strokeWidth="2.6"
        />
        {/* Cuerpo musculoso */}
        <ellipse cx="50" cy="60" rx="24" ry="16" fill="#9a3412" />
        {/* Torso / pecho muy marcado */}
        <path
          d="M40 52 C46 46 54 46 60 52"
          stroke="#fed7aa"
          strokeWidth="3"
        />
        {/* Cabeza agresiva */}
        <circle cx="68" cy="48" r="11" fill="#9a3412" />
        {/* Oreja */}
        <circle cx="75" cy="40" r="5" fill="#f97316" />
        {/* Hocico */}
        <circle cx="80" cy="50" r="2.5" fill="#fee2e2" />
        {/* Ojo con ceja */}
        <circle cx="66" cy="46" r="2" fill="#fef2f2" />
        <path d="M62 44 L70 43" stroke="#b91c1c" strokeWidth="1.6" />
        {/* Puños arriba */}
        <path d="M44 56 L38 47" stroke="#fed7aa" strokeWidth="3" />
        <circle cx="36" cy="45" r="3" fill="#f97316" />
        <path d="M56 56 L62 47" stroke="#fed7aa" strokeWidth="3" />
        <circle cx="64" cy="45" r="3" fill="#f97316" />
        {/* Piernas firmes */}
        <path d="M46 72 L44 82" stroke="#7c2d12" strokeWidth="2.4" />
        <path d="M56 72 L58 82" stroke="#7c2d12" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

