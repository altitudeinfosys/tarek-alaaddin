import { ImageResponse } from 'next/og'

export const alt = 'Tarek Alaaddin — senior engineer building AI automations and apps'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default share image for every page without its own (blog posts generate theirs).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: '#0b1220',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Mark + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <svg width="88" height="64" viewBox="0 0 44 32" fill="none">
            <path d="M8.5 4.5H4.5V27.5H8.5M35.5 4.5H39.5V27.5H35.5" stroke="#38bdf8" strokeWidth="3" />
            <path d="M11 9.5H21M16 9.5V24" stroke="#f8fafc" strokeWidth="3" />
            <path d="M23 24L27.5 8.5L32 24M24.9 18.5H30.1" stroke="#f8fafc" strokeWidth="3" />
          </svg>
          <div style={{ display: 'flex', fontSize: '32px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Tarek Alaaddin
          </div>
        </div>

        {/* Statement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '80px',
              color: '#f8fafc',
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
            }}
          >
            <div style={{ display: 'flex' }}>Agents that run unattended.</div>
            <div style={{ display: 'flex' }}>Apps that ship.</div>
          </div>
          <div style={{ display: 'flex', fontSize: '28px', color: '#94a3b8', lineHeight: 1.4 }}>
            Senior engineer · AI automation · 20+ years in enterprise software
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #1f2937',
            fontSize: '22px',
            color: '#94a3b8',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>tarekalaaddin.com</div>
          <div style={{ display: 'flex', color: '#38bdf8' }}>Open to senior roles</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
