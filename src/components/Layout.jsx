import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from './ui/button'

export default function Layout({ children }) {
  const { profile, signOut } = useAuthStore()
  const { pathname } = useLocation()

  const nav = [
    { to: '/quotations', label: '報價單' },
    ...(profile?.role === 'admin' ? [{ to: '/products', label: '品名庫' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold">馬尼通訊</span>
          {nav.map(item => (
            <Link key={item.to} to={item.to}
              className={`text-sm ${pathname.startsWith(item.to) ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{profile?.name}</span>
          <Button variant="outline" size="sm" onClick={signOut}>登出</Button>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
