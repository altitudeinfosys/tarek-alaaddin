// "[TA]" — initials inside accent brackets. Drawn as strokes so it needs no
// font and stays sharp at any size; letters follow the text color.
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 32" className={className} aria-hidden="true" fill="none" strokeWidth={3}>
      <path
        d="M8.5 4.5H4.5V27.5H8.5M35.5 4.5H39.5V27.5H35.5"
        className="stroke-primary-600 dark:stroke-primary-400"
      />
      <g stroke="currentColor">
        <path d="M11 9.5H21M16 9.5V24" />
        <path d="M23 24L27.5 8.5L32 24M24.9 18.5H30.1" />
      </g>
    </svg>
  )
}
