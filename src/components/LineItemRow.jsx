import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useRef, useEffect } from 'react'
import { useProducts } from '../hooks/useProducts'
import { calcItemTotal, formatCurrency } from '../lib/calc'
import { Input } from './ui/input'

export default function LineItemRow({ item, index, showCash, showCard, onChange, onRemove, disabled }) {
  const { products } = useProducts({ activeOnly: true })
  const [query, setQuery] = useState(item.product_name ?? '')
  const [showDrop, setShowDrop] = useState(false)
  const dropRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item._key })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const filtered = products.filter(p =>
    p.name.includes(query) || (p.spec ?? '').includes(query)
  ).slice(0, 8)

  useEffect(() => {
    const close = (e) => { if (!dropRef.current?.contains(e.target)) setShowDrop(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const pick = (p) => {
    onChange({ ...item, product_name: p.name, spec: p.spec ?? '', unit: p.unit, cash_price: p.cash_price, card_price: p.card_price })
    setQuery(p.name)
    setShowDrop(false)
  }

  const set = (key, val) => onChange({ ...item, [key]: val })

  return (
    <tr ref={setNodeRef} style={style} className="border-b">
      <td className="px-2 py-1 text-gray-400 text-xs">{index + 1}</td>
      <td className="px-2 py-1">
        {!disabled && (
          <button {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 select-none">⠿</button>
        )}
      </td>
      <td className="px-2 py-1 relative min-w-[160px]" ref={dropRef}>
        <Input value={query} disabled={disabled} className="h-8 text-sm"
          placeholder="品名"
          onChange={e => { setQuery(e.target.value); set('product_name', e.target.value); setShowDrop(true) }}
          onFocus={() => setShowDrop(true)} />
        {showDrop && filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 w-64 bg-white border rounded shadow-lg max-h-48 overflow-auto">
            {filtered.map(p => (
              <div key={p.id} className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                onMouseDown={() => pick(p)}>
                <div className="font-medium">{p.name}</div>
                {p.spec && <div className="text-xs text-gray-500">{p.spec}</div>}
              </div>
            ))}
          </div>
        )}
      </td>
      <td className="px-2 py-1 w-28">
        <Input value={item.spec ?? ''} disabled={disabled} className="h-8 text-sm"
          placeholder="規格" onChange={e => set('spec', e.target.value)} />
      </td>
      <td className="px-2 py-1 w-16">
        <Input type="number" value={item.qty} disabled={disabled} className="h-8 text-sm text-center"
          onChange={e => set('qty', Number(e.target.value))} />
      </td>
      <td className="px-2 py-1 w-14">
        <Input value={item.unit} disabled={disabled} className="h-8 text-sm text-center"
          onChange={e => set('unit', e.target.value)} />
      </td>
      {showCash && (
        <>
          <td className="px-2 py-1 w-24">
            <Input type="number" value={item.cash_price} disabled={disabled} className="h-8 text-sm text-right"
              onChange={e => set('cash_price', Number(e.target.value))} />
          </td>
          <td className="px-2 py-1 w-24 text-right text-sm font-medium">
            {formatCurrency(calcItemTotal(item.qty, item.cash_price))}
          </td>
        </>
      )}
      {showCard && (
        <>
          <td className="px-2 py-1 w-24">
            <Input type="number" value={item.card_price} disabled={disabled} className="h-8 text-sm text-right"
              onChange={e => set('card_price', Number(e.target.value))} />
          </td>
          <td className="px-2 py-1 w-24 text-right text-sm font-medium">
            {formatCurrency(calcItemTotal(item.qty, item.card_price))}
          </td>
        </>
      )}
      {!disabled && (
        <td className="px-2 py-1 w-8 text-center">
          <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
        </td>
      )}
    </tr>
  )
}
