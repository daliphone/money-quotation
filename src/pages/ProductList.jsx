import { useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

const CATEGORIES = ['手機', '配件', '方案', '其他']
const EMPTY = { name: '', spec: '', unit: '台', cash_price: '', card_price: '', category: '其他', active: true }

export default function ProductList() {
  const { products, loading, save, toggle } = useProducts()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openNew = () => { setForm(EMPTY); setError(''); setOpen(true) }
  const openEdit = (p) => { setForm(p); setError(''); setOpen(true) }
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    if (!form.name) { setError('品名必填'); return }
    setSaving(true)
    try {
      await save({ ...form, cash_price: Number(form.cash_price), card_price: Number(form.card_price) })
      setOpen(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">載入中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">品名庫</h1>
        <Button onClick={openNew}>+ 新增品名</Button>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['分類','品名','規格','單位','現金價','刷卡價','狀態','操作'].map(h => (
                <th key={h} className="px-4 py-2 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={`border-b ${!p.active ? 'opacity-40' : ''}`}>
                <td className="px-4 py-2">{p.category}</td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-gray-500">{p.spec}</td>
                <td className="px-4 py-2">{p.unit}</td>
                <td className="px-4 py-2">{p.cash_price.toLocaleString()}</td>
                <td className="px-4 py-2">{p.card_price.toLocaleString()}</td>
                <td className="px-4 py-2">{p.active ? '啟用' : '停用'}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>編輯</Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(p.id, !p.active)}>
                    {p.active ? '停用' : '啟用'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{form.id ? '編輯品名' : '新增品名'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>分類</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {[['品名 *','name'],['規格','spec'],['單位','unit']].map(([label, key]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
            {[['現金價','cash_price'],['刷卡價','card_price']].map(([label, key]) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input type="number" value={form[key] ?? ''} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? '儲存中...' : '儲存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
