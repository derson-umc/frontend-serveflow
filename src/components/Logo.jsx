export default function Logo({ size = 48, showText = true, textSize = "xl", light = false }) {
  const id = `lg-${size}`;
  const textColor = light ? "#ffffff" : "#2d2d2d";
  const subColor = light ? "rgba(255,255,255,0.5)" : "#3a7d1e";

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f07820" />
            <stop offset="50%" stopColor="#f0b820" />
            <stop offset="100%" stopColor="#2d2d2d" />
          </linearGradient>
          <linearGradient id={`${id}-swoosh`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07820" />
            <stop offset="100%" stopColor="#f0b820" />
          </linearGradient>
        </defs>

        <circle cx="28" cy="28" r="27" fill="white" />
        <circle cx="28" cy="28" r="26.5" stroke={`url(#${id}-ring)`} strokeWidth="1.5" fill="none" />

        <line x1="21" y1="13" x2="21" y2="27" stroke="#2d2d2d" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="19" y1="13" x2="19" y2="18" stroke="#2d2d2d" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="23" y1="13" x2="23" y2="18" stroke="#2d2d2d" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M19 18 Q21 20.5 23 18" stroke="#2d2d2d" strokeWidth="1.3" fill="none" strokeLinecap="round" />

        <line x1="29" y1="13" x2="29" y2="27" stroke="#2d2d2d" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M29 13 Q33 15.5 31.5 19 L29 20" stroke="#2d2d2d" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M14 30 Q28 26 42 30" stroke={`url(#${id}-swoosh)`} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M16 33 Q28 37 40 33" stroke="#3a7d1e" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        <path d="M36 18 L42 14 L40 20" stroke="#f07820" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        <path d="M31 13 Q34 10 37 12 Q35 15 31 13Z" fill="#3a7d1e" />
        <path d="M31 13 Q34 11.5 37 12" stroke="#3a7d1e" strokeWidth="0.8" fill="none" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold"
            style={{
              fontSize: textSize === "2xl" ? "1.4rem" : textSize === "xl" ? "1.2rem" : "1rem",
              letterSpacing: "-0.03em",
              color: textColor,
            }}
          >
            Serve<span style={{ color: "#f07820" }}>Flow</span>
          </span>
          <span
            style={{
              color: subColor,
              fontSize: "0.6rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: "2px",
            }}
          >
            Restaurante
          </span>
        </div>
      )}
    </div>
  );
}
