// "TA" + terminal cursor. Drawn as strokes so it needs no font and stays sharp
// at any size; letters follow the text color, the cursor is the accent.
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 32" className={className} aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth={3}>
        <path d="M3 9.5H14M8.5 9.5V24" />
        <path d="M15.5 24L20 8.5L24.5 24M17.4 18.5H22.6" />
      </g>
      <rect x="29" y="8" width="7" height="16" className="animate-cursor-blink fill-primary-600 dark:fill-primary-400" />
    </svg>
  )
}
