import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import QuotationList from './pages/QuotationList'
import QuotationForm from './pages/QuotationForm'
import ProductList from './pages/ProductList'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/quotations" element={<Layout><QuotationList /></Layout>} />
        <Route path="/quotations/new" element={<Layout><QuotationForm /></Layout>} />
        <Route path="/quotations/:id" element={<Layout><QuotationForm /></Layout>} />
        <Route path="/products" element={<Layout><ProductList /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="*" element={<Navigate to="/quotations" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
