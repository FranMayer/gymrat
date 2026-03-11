import type { SVGProps } from 'react';

export function RatNovice(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Cola */}
        <path
          d="M20 70 C10 65 10 55 20 50"
          stroke="#4b5563"
          strokeWidth="2"
        />
        {/* Cuerpo */}
        <ellipse cx="55" cy="60" rx="22" ry="16" fill="#4b5563" />
        {/* Cabeza */}
        <circle cx="72" cy="50" r="10" fill="#4b5563" />
        {/* Oreja */}
        <circle cx="78" cy="42" r="5" fill="#6b7280" />
        {/* Hocico */}
        <circle cx="81" cy="52" r="2" fill="#e5e7eb" />
        {/* Ojo */}
        <circle cx="70" cy="48" r="1.8" fill="#e5e7eb" />
        {/* Patitas */}
        <path d="M48 72 L46 78" stroke="#374151" strokeWidth="2" />
        <path d="M60 72 L62 78" stroke="#374151" strokeWidth="2" />
      </g>
    </svg>
  );
}

