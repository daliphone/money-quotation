import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuotations } from '../hooks/useQuotations'
import StatusBadge from '../components/StatusBadge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

const FILTERS = ['全部', 'draft', 'sent', 'deal', 'expired']
const FILTER_LABELS = { '全部': '全部', draft: '草稿', sent: '已送出', deal: '已成交', expired: '已過期' }

export default function QuotationList() {
  const navigate = useNavigate()
  const { quotations, loading, remove, duplicate } = useQuotations()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('全部')

  const filtered = quotations.filter(q => {
    const okStatus = activeFilter === '全部' || q.status === activeFilter
    const okSearch = !search || q.client_name.includes(search) || q.number.includes(search)
    return okStatus && okSearch
  })

  const handleDuplicate = async (id) => {
    const newId = await duplicate(id)
    if (newId) navigate(`/quotations/${newId}`)
  }

  if (loading) return <div className="text-gray-400">載入中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">報價單</h1>
        <Button onClick={() => navigate('/quotations/new')}>+ 新增報價單</Button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="搜尋客戶或單號..." value={search}
          onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-1">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded text-sm border ${activeFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['單號','客戶','日期','狀態','建立人','操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">沒有符合的報價單</td></tr>
            )}
            {filtered.map(q => (
              <tr key={q.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate(`/quotations/${q.id}`)}>{q.number}</td>
                <td className="px-4 py-3">{q.client_name}</td>
                <td className="px-4 py-3 text-gray-500">{q.date}</td>
                <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                <td className="px-4 py-3 text-gray-500">{q.profiles?.name}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/quotations/${q.id}`)}>開啟</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDuplicate(q.id)}>複製</Button>
                  <Button size="sm" variant="ghost" className="text-red-500"
                    onClick={() => { if (confirm(`確認刪除 ${q.number}？`)) remove(q.id) }}>刪除</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
