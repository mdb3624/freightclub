import { useEffect, useState } from 'react'
import { TEMPLATE_ICONS } from '@/lib/constants'

interface CommField {
  id: string
  label: string
  placeholder: string
}

interface CommTemplate {
  label: string
  fields: CommField[]
  generate: (f: Record<string, string>) => string
}

const COMM_TEMPLATES: Record<string, CommTemplate> = {
  'rate-confirm': {
    label: 'Rate Confirmation Request',
    fields: [
      { id: 'cf-broker', label: 'Broker Name', placeholder: 'John / ABC Logistics' },
      { id: 'cf-load', label: 'Load Number', placeholder: '#LD-284732' },
      { id: 'cf-lane', label: 'Lane', placeholder: 'Chicago, IL → Dallas, TX' },
      { id: 'cf-rate', label: 'Agreed Rate ($)', placeholder: '2,100' },
      { id: 'cf-carrier', label: 'Carrier / Driver Name', placeholder: 'Mike Johnson / MJ Transport' },
      { id: 'cf-mc', label: 'MC Number', placeholder: 'MC-834211' },
    ],
    generate: (f) =>
      `Hi ${f['cf-broker']},\n\nPer our conversation, please send over the Rate Con for the below load at your earliest convenience:\n\nLoad #: ${f['cf-load']}\nLane: ${f['cf-lane']}\nAgreed Rate: $${f['cf-rate']}\nCarrier: ${f['cf-carrier']} | ${f['cf-mc']}\n\nPlease confirm all accessorials (lumper, TONU protection, detention after 2 hrs free time) are reflected on the Rate Con before we sign.\n\nThank you,\n${f['cf-carrier']}`,
  },
  counter: {
    label: 'Counter-Offer',
    fields: [
      { id: 'co-broker', label: 'Broker Name', placeholder: 'Sarah / Coyote Logistics' },
      { id: 'co-lane', label: 'Lane', placeholder: 'Atlanta, GA → Memphis, TN' },
      { id: 'co-offered', label: 'Their Offer ($)', placeholder: '1,400' },
      { id: 'co-counter', label: 'Your Counter ($)', placeholder: '1,750' },
      { id: 'co-reason', label: 'Reason for Counter', placeholder: 'Heavy load, limited backhaul options' },
    ],
    generate: (f) =>
      `Hi ${f['co-broker']},\n\nThank you for the offer on ${f['co-lane']}.\n\nI've reviewed the lane and at $${f['co-offered']}, we'd be moving below our operating costs when factoring deadhead and ${f['co-reason']}. The market is currently supporting this lane closer to $${f['co-counter']}.\n\nCounter-offer: $${f['co-counter']} all-in.\n\nLet me know if that works — we're ready to move on this today.\n\nBest,`,
  },
  detention: {
    label: 'Detention Request',
    fields: [
      { id: 'det-broker', label: 'Broker Name', placeholder: 'Tom / Echo Global' },
      { id: 'det-load', label: 'Load Number', placeholder: '#LD-993847' },
      { id: 'det-arrive', label: 'Scheduled Appt Time', placeholder: '08:00 AM' },
      { id: 'det-start', label: 'Actual Load Start Time', placeholder: '10:45 AM' },
      { id: 'det-hrs', label: 'Detention Hours Billed', placeholder: '2.75' },
      { id: 'det-rate', label: 'Detention Rate ($/hr)', placeholder: '75' },
    ],
    generate: (f) => {
      const total = (parseFloat(f['det-hrs'] || '0') * parseFloat(f['det-rate'] || '75')).toFixed(0)
      return `Hi ${f['det-broker']},\n\nI'm writing to formally document and request detention pay for load #${f['det-load']}.\n\nScheduled appointment: ${f['det-arrive']}\nLoading did not begin until: ${f['det-start']}\nTotal billable detention hours: ${f['det-hrs']} hours\n\nPer our standard agreement (2 hrs free time), we are billing:\n${f['det-hrs']} hrs × $${f['det-rate']}/hr = $${total}\n\nPlease add this to the settlement or confirm via updated Rate Con. Supporting documentation (ELD timestamps, signed BOL) available upon request.\n\nThank you,`
    },
  },
  tonu: {
    label: 'TONU (Truck Order Not Used)',
    fields: [
      { id: 'tn-broker', label: 'Broker Name', placeholder: 'Lisa / TQL' },
      { id: 'tn-load', label: 'Load Number', placeholder: '#LD-112233' },
      { id: 'tn-cancel', label: 'When Load Was Cancelled', placeholder: '2 hrs before pickup' },
      { id: 'tn-dh', label: 'DH Miles Already Driven', placeholder: '85' },
      { id: 'tn-amount', label: 'TONU Amount Requested ($)', placeholder: '250' },
    ],
    generate: (f) =>
      `Hi ${f['tn-broker']},\n\nThis is a formal TONU (Truck Order Not Used) claim for load #${f['tn-load']}.\n\nThe load was cancelled ${f['tn-cancel']} with ${f['tn-dh']} deadhead miles already committed. We had repositioned our asset specifically for this load, resulting in direct financial loss.\n\nTONU Claim: $${f['tn-amount']}\n\nPer FMCSA guidelines and standard industry practice, cancellations with less than 24-hour notice are subject to TONU compensation. Please process this at your earliest convenience to maintain our carrier relationship.\n\nIf you have questions, please contact me directly.\n\nRegards,`,
  },
  'cold-shipper': {
    label: 'Cold Shipper Outreach',
    fields: [
      { id: 'cs-contact', label: 'Shipper Contact Name', placeholder: 'Mr. Rodriguez' },
      { id: 'cs-company', label: 'Shipper Company', placeholder: 'ABC Manufacturing' },
      { id: 'cs-equip', label: 'Equipment Type', placeholder: 'Dry Van' },
      { id: 'cs-region', label: 'Your Service Region', placeholder: 'Midwest & Southeast' },
      { id: 'cs-carrier', label: 'Your Company Name', placeholder: 'Eagle Freight LLC' },
    ],
    generate: (f) =>
      `Hi ${f['cs-contact']},\n\nMy name is [Your Name] with ${f['cs-carrier']}, a licensed and insured carrier (FMCSA) specializing in ${f['cs-equip']} loads throughout the ${f['cs-region']} corridor.\n\nI'm reaching out because we have consistent capacity in lanes that align with ${f['cs-company']}'s shipping patterns and are interested in establishing a reliable direct-carrier relationship.\n\nWhat we offer:\n→ Direct carrier (no brokerage markup)\n→ Real-time GPS tracking & ELD compliance\n→ 24/7 dispatch communication\n→ Competitive contract rates with guaranteed capacity\n\nMany of our shipper partners save 15–25% by going direct vs. spot market rates.\n\nWould you be open to a 10-minute call this week to discuss your current freight needs? I'm happy to provide references and our carrier packet.\n\nBest regards,\n[Your Name] | ${f['cs-carrier']}\nMC: [Your MC#] | DOT: [Your DOT#]`,
  },
}

function getTemplateIcon(key: string): string {
  return TEMPLATE_ICONS[key] ?? '📞'
}

export function CommunicationBuilder() {
  const [commType, setCommType] = useState('rate-confirm')
  const [commFields, setCommFields] = useState<Record<string, string>>({})
  const [commOutput, setCommOutput] = useState('')
  const [commCopied, setCommCopied] = useState(false)

  useEffect(() => { setCommFields({}); setCommOutput('') }, [commType])

  function generateComm() {
    const tmpl = COMM_TEMPLATES[commType]
    const vals: Record<string, string> = {}
    tmpl.fields.forEach(f => { vals[f.id] = commFields[f.id] || f.placeholder })
    setCommOutput(tmpl.generate(vals))
  }

  function copyComm() {
    navigator.clipboard.writeText(commOutput).then(() => {
      setCommCopied(true)
      setTimeout(() => setCommCopied(false), 2000)
    })
  }

  return (
    <div className="animate-in">
      <div className="section-title">Broker Communication Drafts</div>
      <div className="section-sub">Generate professional carrier-broker communications instantly</div>

      <div className="grid-2 mb-16">
        <div>
          <div className="card mb-16">
            <div className="card-title">Communication Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(COMM_TEMPLATES).map(([key, tmpl]) => (
                <button key={key} className={`btn btn-outline${commType === key ? ' active' : ''}`} onClick={() => setCommType(key)} style={{ textAlign: 'left', letterSpacing: 1 }}>
                  {getTemplateIcon(key)} {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Fill in Details</div>
            {COMM_TEMPLATES[commType].fields.map(f => (
              <div key={f.id} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" placeholder={f.placeholder} value={commFields[f.id] || ''} onChange={e => setCommFields(prev => ({ ...prev, [f.id]: e.target.value }))} />
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={generateComm}>
              GENERATE MESSAGE →
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Generated Message</div>
          <div className="comm-output">
            {commOutput || <span style={{ color: 'var(--muted)' }}>Select a template and fill in details to generate your message.</span>}
            <button className="copy-btn" onClick={copyComm} disabled={!commOutput}>
              {commCopied ? '✓ COPIED' : 'COPY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
