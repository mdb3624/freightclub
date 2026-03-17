import type { LoadContactInfo } from '../types'

interface ContactCardProps {
  title: string
  contact: LoadContactInfo
}

export function ContactCard({ title, contact }: ContactCardProps) {
  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
      <h3 className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
      {contact.businessName && (
        <p className="text-sm text-gray-600">{contact.businessName}</p>
      )}
      <div className="mt-2 space-y-1">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
          >
            <span>📞</span> {contact.phone}
          </a>
        )}
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
        >
          <span>✉</span> {contact.email}
        </a>
      </div>
      {(contact.mcNumber || contact.dotNumber) && (
        <div className="mt-2 flex gap-4 text-xs text-gray-500">
          {contact.mcNumber && <span>MC# {contact.mcNumber}</span>}
          {contact.dotNumber && <span>DOT# {contact.dotNumber}</span>}
        </div>
      )}
    </div>
  )
}
