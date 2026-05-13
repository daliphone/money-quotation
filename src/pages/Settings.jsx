import { useState, useEffect } from 'react'
import { useSettings } from '../hooks/useSettings'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

const FIELDS = [
  { section: '公司基本資訊' },
  { key: 'name', label: '公司名稱 *' },
  { key: 'contact', label: '聯絡人' },
  { key: 'phone', label: '電話' },
  { key: 'mobile', label: '手機' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: '地址' },
  { key: 'tax_id', label: '統一編號' },
  { section: '匯款資訊' },
  { key: 'bank_name', label: '匯款銀行' },
  { key: 'bank_branch', label: '分行名稱' },
  { key: 'bank_account', label: '帳號' },
  { key: 'bank_account_name', label: '戶名' },
]

export default function Settings() {
  const { settings, loading, save } = useSettings()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleStampUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { setError('圖片請小於 500KB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => set('stamp_image', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name) { setError('公司名稱必填'); return }
    setSaving(true); setError('')
    try {
      await save(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400">載入中...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">公司設定</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? '✓ 已儲存' : saving ? '儲存中...' : '儲存'}
        </Button>
      </div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {FIELDS.map((f, i) => {
        if (f.section) return (
          <h2 key={i} className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6 mb-3 border-b pb-1">{f.section}</h2>
        )
        return (
          <div key={f.key} className="mb-4">
            <Label>{f.label}</Label>
            <Input value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} />
          </div>
        )
      })}

      {/* 報價專用章 */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-6 mb-3 border-b pb-1">報價專用章</h2>
      <div className="mb-4">
        <Label>上傳章圖片（PNG/JPG，建議尺寸 200×200px，小於 500KB）</Label>
        <input type="file" accept="image/png,image/jpeg,image/gif"
          onChange={handleStampUpload}
          className="mt-1 block text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
        {form.stamp_image && (
          <div className="mt-3 flex items-center gap-4">
            <img src={form.stamp_image} alt="章預覽" className="h-24 w-24 object-contain border rounded" />
            <Button variant="ghost" size="sm" className="text-red-500"
              onClick={() => set('stamp_image', null)}>移除</Button>
          </div>
        )}
        {!form.stamp_image && (
          <p className="mt-2 text-xs text-gray-400">未上傳則使用自動產生的 SVG 章</p>
        )}
      </div>
    </div>
  )
}
