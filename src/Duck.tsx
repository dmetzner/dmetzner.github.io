import { useId } from "react";

// The icon-pet — a rubber duck (the dev's debugging companion).
export function Duck({ className }: { className?: string }) {
  // unique per instance: a hardcoded gradient id would collide when several
  // ducks render at once (terminal + the coin faces), and every fill="url(#id)"
  // would resolve to the first match — which may live in a display:none subtree.
  const gid = useId();
  return (
    <svg className={`duck ${className ?? ""}`} viewBox="0 0 50 40" role="img" aria-label="duck">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe15c" />
          <stop offset="1" stopColor="#f6b400" />
        </linearGradient>
      </defs>
      <path d="M9 20 L1 16 L4 27 Z" fill={`url(#${gid})`} />
      <ellipse cx="21" cy="26" rx="15" ry="10.5" fill={`url(#${gid})`} />
      <circle cx="34" cy="14" r="8.5" fill={`url(#${gid})`} />
      <path d="M41 11 H49 L46 16.5 H41 Z" fill="#ef8b1f" />
      <circle className="duck-eye" cx="35.5" cy="12" r="1.7" fill="#0a0a0f" />
      <path
        d="M15 25 q6 6 13 1"
        fill="none"
        stroke="#b97f0a"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
