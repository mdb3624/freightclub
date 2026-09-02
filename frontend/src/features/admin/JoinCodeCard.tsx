import { useState } from 'react'

interface JoinCodeCardProps {
  joinCode: string
  theme: 'light' | 'dark'
}

// US-875/877 BR-3/AC-2: surfaces the tenant's existing join code — no new invite mechanism.
export function JoinCodeCard({ joinCode, theme }: JoinCodeCardProps) {
  const [copied, setCopied] = useState(false)
  const isLight = theme === 'light'
  const colors = isLight
    ? { border: '#D8CEB8', text: '#1A1A1A', muted: '#4A5568', surface: '#FFFFFF', accent: '#B08D57' }
    : { border: '#2A2A2A', text: '#F5F5F5', muted: '#808080', surface: '#1A1A1A', accent: '#C9A876' }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — the code is still visible to copy manually.
    }
  }

  return (
    <div style={{ padding: 16, borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.surface, marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: colors.muted, marginBottom: 8 }}>
        Invite a team member — share this code
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          data-testid="join-code-value"
          style={{
            fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', color: colors.accent,
            fontFamily: 'monospace',
          }}
        >
          {joinCode}
        </span>
        <button
          data-testid="copy-join-code"
          onClick={handleCopy}
          style={{
            fontSize: 12, padding: '6px 12px', borderRadius: 6,
            border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text, cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
