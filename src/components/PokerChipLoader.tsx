interface PokerChipLoaderProps {
  label?: string
  className?: string
}

export function PokerChipLoader({ label = 'Loading…', className }: PokerChipLoaderProps) {
  const screenClassName = className ? `loading-screen ${className}` : 'loading-screen'

  return (
    <div className={screenClassName} role="status" aria-live="polite">
      <div className="poker-chip-loader" aria-hidden="true">
        <div className="poker-chip-loader__coin">
          <span className="poker-chip-loader__edge" aria-hidden="true" />
          <svg className="poker-chip-loader__face poker-chip-loader__face--front" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="#e92d31" />
            <g fill="#ffffff">
              <rect x="29" y="2" width="6" height="13" rx="1.2" />
              <rect x="29" y="49" width="6" height="13" rx="1.2" />
              <rect x="29" y="2" width="6" height="13" rx="1.2" transform="rotate(60 32 32)" />
              <rect x="29" y="49" width="6" height="13" rx="1.2" transform="rotate(60 32 32)" />
              <rect x="29" y="2" width="6" height="13" rx="1.2" transform="rotate(120 32 32)" />
              <rect x="29" y="49" width="6" height="13" rx="1.2" transform="rotate(120 32 32)" />
            </g>
            <circle cx="32" cy="32" r="22.5" fill="#ef3033" stroke="#ad2025" strokeWidth="2.4" />
            <circle
              cx="32"
              cy="32"
              r="18"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="5 7"
            />
            <path
              fill="#ffffff"
              d="M32 44.2 20.7 32.9c-5.3-5.3 2.2-13.9 8.5-7.7L32 28l2.8-2.8c6.3-6.2 13.8 2.4 8.5 7.7L32 44.2z"
            />
          </svg>
          <svg className="poker-chip-loader__face poker-chip-loader__face--back" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="#111827" />
            <g fill="#ffffff">
              <rect x="29" y="2" width="6" height="13" rx="1.2" />
              <rect x="29" y="49" width="6" height="13" rx="1.2" />
              <rect x="29" y="2" width="6" height="13" rx="1.2" transform="rotate(60 32 32)" />
              <rect x="29" y="49" width="6" height="13" rx="1.2" transform="rotate(60 32 32)" />
              <rect x="29" y="2" width="6" height="13" rx="1.2" transform="rotate(120 32 32)" />
              <rect x="29" y="49" width="6" height="13" rx="1.2" transform="rotate(120 32 32)" />
            </g>
            <circle cx="32" cy="32" r="22.5" fill="#1f2937" stroke="#030712" strokeWidth="2.4" />
            <circle
              cx="32"
              cy="32"
              r="18"
              fill="none"
              stroke="#ef3033"
              strokeWidth="3.5"
              strokeDasharray="5 7"
            />
            <path
              fill="#ffffff"
              d="M32 17.5c-8.1 7.1-12.4 11.6-12.4 17.3 0 5 4.2 8.4 9.1 6.5-.7 4.2-2.5 7.4-5.1 9.2h16.8c-2.6-1.8-4.4-5-5.1-9.2 4.9 1.9 9.1-1.5 9.1-6.5 0-5.7-4.3-10.2-12.4-17.3z"
            />
          </svg>
        </div>
      </div>
      <p className="poker-chip-loader__label">{label}</p>
    </div>
  )
}
