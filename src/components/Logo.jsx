export default function Logo({ size = 48, showText = true, textSize = "xl" }) {
  const id = `lg-${size}`;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`${id}-bg`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#080404" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id={`${id}-icon`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#9f1239" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="28" cy="28" r="27" fill={`url(#${id}-bg)`} />
        <circle cx="28" cy="28" r="26.5" stroke={`url(#${id}-ring)`} strokeWidth="1" fill="none" />

        <ellipse cx="28" cy="36" rx="13" ry="2.5" stroke={`url(#${id}-icon)`} strokeWidth="1.5" fill="none" opacity="0.6" />

        <path
          d="M15 36 Q15 22 28 20 Q41 22 41 36"
          stroke={`url(#${id}-icon)`}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          filter={`url(#${id}-glow)`}
        />
        <line x1="14" y1="36" x2="42" y2="36" stroke={`url(#${id}-icon)`} strokeWidth="1.8" strokeLinecap="round" />

        <circle cx="28" cy="20" r="2" fill={`url(#${id}-icon)`} filter={`url(#${id}-glow)`} />

        <g filter={`url(#${id}-glow)`}>
          <line x1="10" y1="12" x2="10" y2="24" stroke={`url(#${id}-icon)`} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8"  y1="12" x2="8"  y2="17" stroke={`url(#${id}-icon)`} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="12" y2="17" stroke={`url(#${id}-icon)`} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 17 Q10 19.5 12 17" stroke={`url(#${id}-icon)`} strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>

        <g filter={`url(#${id}-glow)`}>
          <line x1="46" y1="12" x2="46" y2="24" stroke={`url(#${id}-icon)`} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M46 12 Q50 14.5 48.5 18 L46 19" stroke={`url(#${id}-icon)`} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <ellipse cx="22" cy="18" rx="5" ry="3" fill="white" fillOpacity="0.04" transform="rotate(-20, 22, 18)" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold text-white"
            style={{ fontSize: textSize === "2xl" ? "1.4rem" : textSize === "xl" ? "1.2rem" : "1rem", letterSpacing: "-0.03em" }}
          >
            Serve<span style={{ color: "#f43f5e" }}>Flow</span>
          </span>
          <span
            className="text-xs tracking-widest uppercase mt-0.5"
            style={{ color: "#e11d48", fontSize: "0.6rem", letterSpacing: "0.14em" }}
          >
            Restaurante
          </span>
        </div>
      )}
    </div>
  );
}
