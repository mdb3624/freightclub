interface StatCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, sub, className = '' }: StatCardProps) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
