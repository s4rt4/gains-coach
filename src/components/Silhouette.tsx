// Placeholder physique photo for the demo (no real photos are stored).
export function Silhouette({ view }: { view: "front" | "side" | "back" }) {
  const side = view === "side";
  return (
    <svg viewBox="0 0 120 200" className="h-full w-full" aria-label={`${view} photo placeholder`}>
      <defs>
        <linearGradient id={`sg-${view}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a3f48" />
          <stop offset="100%" stopColor="#23272e" />
        </linearGradient>
      </defs>
      <rect width="120" height="200" fill="#15181d" />
      <g fill={`url(#sg-${view})`}>
        <circle cx="60" cy="26" r="13" />
        {side ? (
          <>
            <path d="M52 42 h16 l6 22 l-3 40 l-4 6 h-14 l-4 -6 l-2 -40 z" />
            <path d="M58 48 l8 4 l2 40 l-5 2 l-4 -36 z" opacity="0.8" />
            <path d="M53 108 h15 l-1 44 l2 36 h-9 l-3 -36 l-4 -44 z" />
          </>
        ) : (
          <>
            <path d="M30 46 Q60 36 90 46 L84 80 L78 108 H42 L36 80 Z" />
            <path d="M30 46 l-10 6 l-4 46 l7 2 l9 -40 z" />
            <path d="M90 46 l10 6 l4 46 l-7 2 l-9 -40 z" />
            <path d="M42 108 H78 l-2 44 l-3 36 h-10 l-3 -46 l-3 46 h-10 l-3 -36 z" />
          </>
        )}
      </g>
      {view === "front" && <path d="M54 66 v32 M66 66 v32 M50 78 h20 M50 90 h20" stroke="#15181d" strokeWidth="1.2" opacity="0.6" />}
      {view === "back" && <path d="M60 50 v56 M44 60 q16 10 32 0" stroke="#15181d" strokeWidth="1.2" fill="none" opacity="0.6" />}
    </svg>
  );
}
