import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import StatusBadge from '../components/StatusBadge'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import LineItemRow from '../components/LineItemRow'
import { calcSubtotal, calcTax, calcGrandTotal, formatCurrency } from '../lib/calc'
import QuotationPDF from '../components/QuotationPDF'
import { exportToPDF } from '../lib/pdf'
import { useSettings } from '../hooks/useSettings'

const EMPTY_FORM = {
  client_name: '', client_tax_id: '',
  client_contact: '', client_phone: '', client_mobile: '',
  client_fax: '', client_email: '', client_address: '',
  date: new Date().toISOString().slice(0, 10),
  valid_days: 30, show_cash: true, show_card: true,
  tax_rate: 0, notes: '', status: 'draft',
  buyer_name: '', buyer_address: '', buyer_phone: '',
}

export default function QuotationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id
  const { settings } = useSettings()

  const [form, setForm] = useState(EMPTY_FORM)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const isReadOnly = ['deal', 'expired'].includes(form.status)
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const newItem = () => ({
    _key: crypto.randomUUID(),
    product_name: '', spec: '', qty: 1, unit: '台', cash_price: 0, card_price: 0,
  })

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
          .insert({ ...form, created_by: null }).select().single()
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

  const handleExport = async () => {
    setExporting(true)
    try {
      await new Promise(r => setTimeout(r, 500))
      await exportToPDF('pdf-container', `${form.number}-${form.client_name}.pdf`)
    } catch (e) {
      setError('PDF 產生失敗：' + e.message)
    } finally {
      setExporting(false)
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
          {!isNew && (
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? '產生中...' : '匯出 PDF'}
            </Button>
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

      {/* 明細列 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4 overflow-x-auto">
        <DndContext collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!over || active.id === over.id) return
            setItems(prev => {
              const from = prev.findIndex(i => i._key === active.id)
              const to = prev.findIndex(i => i._key === over.id)
              return arrayMove(prev, from, to)
            })
          }}>
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left w-8 text-gray-500">#</th>
                <th className="w-6"></th>
                <th className="px-2 py-2 text-left">品名</th>
                <th className="px-2 py-2 text-left">規格</th>
                <th className="px-2 py-2 text-center">數量</th>
                <th className="px-2 py-2 text-center">單位</th>
                {form.show_cash && <><th className="px-2 py-2 text-right">現金單價</th><th className="px-2 py-2 text-right">現金總價</th></>}
                {form.show_card && <><th className="px-2 py-2 text-right">刷卡單價</th><th className="px-2 py-2 text-right">刷卡總價</th></>}
                {!isReadOnly && <th className="w-8"></th>}
              </tr>
            </thead>
            <SortableContext items={items.map(i => i._key)} strategy={verticalListSortingStrategy}>
              <tbody>
                {items.map((item, idx) => (
                  <LineItemRow key={item._key} item={item} index={idx}
                    showCash={form.show_cash} showCard={form.show_card} disabled={isReadOnly}
                    onChange={updated => setItems(prev => prev.map(i => i._key === item._key ? updated : i))}
                    onRemove={() => setItems(prev => prev.filter(i => i._key !== item._key))} />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>

        {!isReadOnly && (
          <button onClick={() => setItems(prev => [...prev, newItem()])}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800">+ 新增項目</button>
        )}

        {/* 合計 */}
        <div className="mt-4 flex justify-end">
          <table className="text-sm w-64">
            <tbody>
              {form.show_cash && (
                <tr>
                  <td className="py-1 text-gray-500">現金小計</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(calcSubtotal(items, 'cash_price'))}</td>
                </tr>
              )}
              {form.show_card && (
                <tr>
                  <td className="py-1 text-gray-500">刷卡小計</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(calcSubtotal(items, 'card_price'))}</td>
                </tr>
              )}
              {form.tax_rate > 0 && (
                <tr>
                  <td className="py-1 text-gray-500">稅額 ({form.tax_rate}%)</td>
                  <td className="py-1 text-right">
                    {formatCurrency(calcTax(calcSubtotal(items, form.show_cash ? 'cash_price' : 'card_price'), form.tax_rate))}
                  </td>
                </tr>
              )}
              <tr className="border-t font-bold">
                <td className="pt-2">總計</td>
                <td className="pt-2 text-right">
                  {formatCurrency(calcGrandTotal(
                    calcSubtotal(items, form.show_cash ? 'cash_price' : 'card_price'),
                    calcTax(calcSubtotal(items, form.show_cash ? 'cash_price' : 'card_price'), form.tax_rate)
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 客戶詳細資訊 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">客戶詳細資訊</p>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>聯絡人</Label>
            <Input value={form.client_contact ?? ''} disabled={isReadOnly} onChange={e => set('client_contact', e.target.value)} /></div>
          <div><Label>電話</Label>
            <Input value={form.client_phone ?? ''} disabled={isReadOnly} onChange={e => set('client_phone', e.target.value)} /></div>
          <div><Label>手機</Label>
            <Input value={form.client_mobile ?? ''} disabled={isReadOnly} onChange={e => set('client_mobile', e.target.value)} /></div>
          <div><Label>傳真</Label>
            <Input value={form.client_fax ?? ''} disabled={isReadOnly} onChange={e => set('client_fax', e.target.value)} /></div>
          <div><Label>Email</Label>
            <Input type="email" value={form.client_email ?? ''} disabled={isReadOnly} onChange={e => set('client_email', e.target.value)} /></div>
          <div><Label>地址</Label>
            <Input value={form.client_address ?? ''} disabled={isReadOnly} onChange={e => set('client_address', e.target.value)} /></div>
        </div>
      </div>

      {/* 採購方資訊 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">採購方資訊（顯示於 PDF 簽章欄）</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>採購單位名稱</Label>
            <Input value={form.buyer_name ?? ''} disabled={isReadOnly}
              onChange={e => set('buyer_name', e.target.value)} /></div>
          <div><Label>地址</Label>
            <Input value={form.buyer_address ?? ''} disabled={isReadOnly}
              onChange={e => set('buyer_address', e.target.value)} /></div>
          <div><Label>電話</Label>
            <Input value={form.buyer_phone ?? ''} disabled={isReadOnly}
              onChange={e => set('buyer_phone', e.target.value)} /></div>
        </div>
      </div>

      {/* 附記 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Label>附記</Label>
        <textarea value={form.notes ?? ''} disabled={isReadOnly}
          onChange={e => set('notes', e.target.value)}
          className="mt-1 w-full border rounded p-2 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="例：以上報價未稅，報價有效期限30天" />
      </div>

      {exporting && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '794px', overflow: 'hidden', opacity: 0.01, pointerEvents: 'none', zIndex: -1 }}>
          <div id="pdf-container">
            <QuotationPDF quotation={form} items={items} settings={settings} />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
