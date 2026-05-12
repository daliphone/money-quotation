const STATUS_CONFIG = {
  draft:   { label: '草稿',   className: 'bg-gray-100 text-gray-700' },
  sent:    { label: '已送出', className: 'bg-blue-100 text-blue-700' },
  deal:    { label: '已成交', className: 'bg-green-100 text-green-700' },
  expired: { label: '已過期', className: 'bg-red-100 text-red-700' },
}

export default function StatusBadge({ status }) {
  const { label, className } = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
