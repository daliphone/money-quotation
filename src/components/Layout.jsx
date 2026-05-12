import { Link, useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const { pathname } = useLocation()

  const nav = [
    { to: '/quotations', label: '報價單' },
    { to: '/products', label: '品名庫' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center gap-6">
        <span className="font-bold">Money 通訊</span>
        {nav.map(item => (
          <Link key={item.to} to={item.to}
            className={`text-sm ${pathname.startsWith(item.to) ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
