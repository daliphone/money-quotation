import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import StatusBadge from '../components/StatusBadge'

const EMPTY_FORM = {
  client_name: '', client_tax_id: '',
  date: new Date().toISOString().slice(0, 10),
  valid_days: 30, show_cash: true, show_card: true,
  tax_rate: 0, notes: '', status: 'draft',
}

export default function QuotationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const isNew = !id

  const [form, setForm] = useState(EMPTY_FORM)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isReadOnly = ['deal', 'expired'].includes(form.status)
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    if (!id) return
    supabase.from('quotations').select('*, quotation_items(*)')
      .eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          const { quotation_items, ...rest } = data
          setForm(rest)
          setItems((quotation_items ?? []).sort((a, b) => a.seq - b.seq).map(i => ({ ...i, _key: i.id })))
        }
        setLoading(false)
      })
  }, [id])

  const handleSave = async () => {
    if (!form.client_name) { setError('客戶名稱必填'); return }
    setSaving(true); setError('')
    try {
      let qId = id
      if (isNew) {
        const { data, error: e } = await supabase.from('quotations')
          .insert({ ...form, created_by: profile.id }).select().single()
        if (e) throw e
        qId = data.id
      } else {
        const { error: e } = await supabase.from('quotations').update(form).eq('id', id)
        if (e) throw e
      }
      await supabase.from('quotation_items').delete().eq('quotation_id', qId)
      if (items.length > 0) {
        await supabase.from('quotation_items').insert(
          items.map(({ _key, id: _i, ...item }, idx) => ({ ...item, quotation_id: qId, seq: idx }))
        )
      }
      if (isNew) navigate(`/quotations/${qId}`, { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (status) => {
    const { error: e } = await supabase.from('quotations').update({ status }).eq('id', id)
    if (!e) set('status', status)
  }

  if (loading) return <div className="text-gray-400">載入中...</div>

  return (
    <div className="max-w-5xl mx-auto">
      {/* 頂部列 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/quotations')} className="text-gray-400 hover:text-gray-700 text-xl">←</button>
          <h1 className="text-xl font-bold">{isNew ? '新增報價單' : form.number}</h1>
          {!isNew && <StatusBadge status={form.status} />}
        </div>
        <div className="flex gap-2">
          {!isNew && !isReadOnly && form.status === 'draft' && (
            <Button variant="outline" onClick={() => handleStatusChange('sent')}>標記已送出</Button>
          )}
          {!isNew && !isReadOnly && form.status === 'sent' && (
            <>
              <Button variant="outline" onClick={() => handleStatusChange('deal')}>標記已成交</Button>
              <Button variant="outline" onClick={() => handleStatusChange('expired')}>標記已過期</Button>
            </>
          )}
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving}>{saving ? '儲存中...' : '儲存'}</Button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          此報價單已鎖定（{form.status === 'deal' ? '已成交' : '已過期'}），不可編輯。
        </div>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* 表頭欄位 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>客戶名稱 *</Label>
            <Input value={form.client_name} disabled={isReadOnly}
              onChange={e => set('client_name', e.target.value)} /></div>
          <div><Label>統一編號</Label>
            <Input value={form.client_tax_id ?? ''} disabled={isReadOnly}
              onChange={e => set('client_tax_id', e.target.value)} /></div>
          <div><Label>報價日期</Label>
            <Input type="date" value={form.date} disabled={isReadOnly}
              onChange={e => set('date', e.target.value)} /></div>
          <div><Label>有效天數</Label>
            <Input type="number" value={form.valid_days} disabled={isReadOnly}
              onChange={e => set('valid_days', Number(e.target.value))} /></div>
        </div>
        <div className="mt-4 flex gap-6 items-center flex-wrap">
          <span className="text-sm text-gray-500">顯示欄位：</span>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.show_cash} disabled={isReadOnly}
              onChange={e => set('show_cash', e.target.checked)} />
            現金價
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.show_card} disabled={isReadOnly}
              onChange={e => set('show_card', e.target.checked)} />
            刷卡價
          </label>
          <div className="flex items-center gap-2">
            <Label className="text-sm">稅率</Label>
            <Select value={String(form.tax_rate)} disabled={isReadOnly}
              onValueChange={v => set('tax_rate', Number(v))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">未稅 (0%)</SelectItem>
                <SelectItem value="5">含稅 (5%)</SelectItem>
                <SelectItem value="8">含稅 (8%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 明細列佔位 — Task 8 將替換 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4 text-sm text-gray-400">
        明細列（Task 8 實作）
      </div>

      {/* 附記 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Label>附記</Label>
        <textarea value={form.notes ?? ''} disabled={isReadOnly}
          onChange={e => set('notes', e.target.value)}
          className="mt-1 w-full border rounded p-2 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="例：以上報價未稅，報價有效期限30天" />
      </div>
    </div>
  )
}
