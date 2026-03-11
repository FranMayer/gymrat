import type { SVGProps } from 'react';

export function RatApex(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <radialGradient id="apexAura" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#ccff00" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Aura */}
      <circle cx="50" cy="52" r="32" fill="url(#apexAura)" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Cola poderosa */}
        <path
          d="M18 70 C4 56 10 40 30 36"
          stroke="#b91c1c"
          strokeWidth="3"
        />
        {/* Cuerpo imponente */}
        <ellipse cx="50" cy="60" rx="26" ry="17" fill="#7f1d1d" />
        {/* Pecho ancho */}
        <path
          d="M38 52 C46 44 54 44 62 52"
          stroke="#fecaca"
          strokeWidth="3.4"
        />
        {/* Cabeza */}
        <circle cx="70" cy="48" r="12" fill="#7f1d1d" />
        {/* Orejas dobles */}
        <circle cx="76" cy="37" r="5" fill="#f97316" />
        <circle cx="66" cy="37" r="4" fill="#facc15" />
        {/* Corona simple */}
        <path
          d="M63 32 L66 26 L70 30 L74 25 L77 32"
          stroke="#facc15"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Hocico */}
        <circle cx="80" cy="50" r="2.5" fill="#fee2e2" />
        {/* Ojo decidido */}
        <circle cx="67" cy="46" r="2.2" fill="#fef2f2" />
        <path d="M62 44 L71 43" stroke="#facc15" strokeWidth="1.6" />
        {/* Brazos en pose de poder */}
        <path d="M46 56 L38 46" stroke="#fecaca" strokeWidth="3.2" />
        <circle cx="36" cy="44" r="3.5" fill="#facc15" />
        <path d="M54 56 L62 46" stroke="#fecaca" strokeWidth="3.2" />
        <circle cx="64" cy="44" r="3.5" fill="#f97316" />
        {/* Piernas sólidas */}
        <path d="M46 72 L44 84" stroke="#4c0519" strokeWidth="2.8" />
        <path d="M56 72 L58 84" stroke="#4c0519" strokeWidth="2.8" />
      </g>
    </svg>
  );
}

