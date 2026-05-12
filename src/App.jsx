import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/Login'
import QuotationList from './pages/QuotationList'
import QuotationForm from './pages/QuotationForm'
import ProductList from './pages/ProductList'

function ProtectedRoute({ children, adminOnly = false }) {
  const { session, profile, loading } = useAuthStore()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">載入中...</div>
  if (!session) return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/quotations" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const { init } = useAuthStore()
  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/quotations" element={<ProtectedRoute><QuotationList /></ProtectedRoute>} />
        <Route path="/quotations/new" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
        <Route path="/quotations/:id" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute adminOnly><ProductList /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/quotations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
