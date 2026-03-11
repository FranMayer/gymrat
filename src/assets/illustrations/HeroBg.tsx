import type { SVGProps } from 'react';

export function HeroBg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 200"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id="heroLines" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="none" />
      {/* Diagonales principales */}
      <path
        d="M-40 210 L140 -10"
        stroke="url(#heroLines)"
        strokeWidth="2"
      />
      <path
        d="M40 210 L220 -10"
        stroke="url(#heroLines)"
        strokeWidth="1.5"
      />
      <path
        d="M120 210 L300 -10"
        stroke="url(#heroLines)"
        strokeWidth="1.5"
      />
      <path
        d="M200 210 L380 -10"
        stroke="url(#heroLines)"
        strokeWidth="2"
      />
      {/* Círculos concéntricos */}
      <g
        transform="translate(320,40)"
        fill="none"
        stroke="var(--accent)"
        strokeOpacity="0.1"
      >
        <circle r="18" />
        <circle r="30" />
        <circle r="44" />
      </g>
      {/* Hexágono tipo placa de peso */}
      <g
        transform="translate(60,140)"
        stroke="var(--accent)"
        strokeOpacity="0.12"
        fill="var(--bg-card)"
        fillOpacity="0.08"
      >
        <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11" />
        <rect
          x="-6"
          y="-14"
          width="12"
          height="28"
          rx="3"
          fill="var(--accent)"
          fillOpacity="0.12"
        />
      </g>
      {/* Barra simplificada */}
      <g
        transform="translate(260,150)"
        stroke="var(--accent)"
        strokeOpacity="0.12"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="-40" y1="0" x2="40" y2="0" />
        <line x1="-52" y1="0" x2="-60" y2="0" />
        <line x1="52" y1="0" x2="60" y2="0" />
      </g>
    </svg>
  );
}

