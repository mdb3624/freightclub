import type { LoadContactInfo } from '../types'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'

interface ContactCardProps {
  title: string
  contact: LoadContactInfo
}

export function ContactCard({ title, contact }: ContactCardProps) {
  const { persona, textClassName, mutedClassName } = usePersonaTheme()
  const isCarrier = persona === 'carrier'

  const containerClass = isCarrier
    ? 'rounded-lg border border-carrier-border bg-carrier-surface p-4'
    : 'rounded-lg border border-primary-200 bg-primary-50 p-4'
  const titleClass = isCarrier
    ? 'text-xs font-semibold text-carrier-accent uppercase tracking-wide mb-2'
    : 'text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2'
  const linkClass = isCarrier
    ? `flex items-center gap-1.5 text-sm ${textClassName} hover:underline`
    : 'flex items-center gap-1.5 text-sm text-primary-600 hover:underline'

  return (
    <div className={containerClass}>
      <h3 className={titleClass}>
        {title}
      </h3>
      <p className={`text-sm font-semibold ${textClassName}`}>{contact.name}</p>
      {contact.businessName && (
        <p className={`text-sm ${mutedClassName}`}>{contact.businessName}</p>
      )}
      <div className="mt-2 space-y-1">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className={linkClass}
          >
            <span>📞</span> {contact.phone}
          </a>
        )}
        <a
          href={`mailto:${contact.email}`}
          className={linkClass}
        >
          <span>✉</span> {contact.email}
        </a>
      </div>
      {(contact.mcNumber || contact.dotNumber) && (
        <div className={`mt-2 flex gap-4 text-xs ${mutedClassName}`}>
          {contact.mcNumber && <span>MC# {contact.mcNumber}</span>}
          {contact.dotNumber && <span>DOT# {contact.dotNumber}</span>}
        </div>
      )}
    </div>
  )
}
