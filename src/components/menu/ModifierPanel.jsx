import { useState, useMemo } from 'react'
import { ArrowLeft, Minus, Plus, MessageSquare } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import useOrderStore from '../../store/orderStore'

export default function ModifierPanel({ product, currency }) {
  const { addItem, closeProduct } = useOrderStore()
  const [quantity, setQuantity] = useState(1)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')

  // selections: groupId → Set of optionIds
  const [selections, setSelections] = useState(() => {
    const init = {}
    for (const g of product.modifierGroups ?? []) {
      init[g.id] = new Set(g.required && g.options.length ? [g.options[0].id] : [])
    }
    return init
  })

  const modifiersExtra = useMemo(() => {
    let total = 0
    for (const g of product.modifierGroups ?? []) {
      for (const o of g.options) {
        if (selections[g.id]?.has(o.id)) total += o.price ?? 0
      }
    }
    return total
  }, [selections, product.modifierGroups])

  const unitPrice = product.price + modifiersExtra
  const totalPrice = unitPrice * quantity

  const canAdd = useMemo(() => {
    for (const g of product.modifierGroups ?? []) {
      if (g.required && !selections[g.id]?.size) return false
    }
    return true
  }, [selections, product.modifierGroups])

  const toggle = (group, option) => {
    setSelections((prev) => {
      const cur = new Set(prev[group.id] ?? [])
      if (!group.multiple) {
        return { ...prev, [group.id]: new Set([option.id]) }
      }
      if (cur.has(option.id)) { cur.delete(option.id) } else { cur.add(option.id) }
      return { ...prev, [group.id]: cur }
    })
  }

  const handleAdd = () => {
    if (!canAdd) return
    const selectedModifiers = []
    for (const g of product.modifierGroups ?? []) {
      for (const o of g.options) {
        if (selections[g.id]?.has(o.id)) {
          selectedModifiers.push({ groupId: g.id, groupName: g.name, optionId: o.id, name: o.name, price: o.price ?? 0 })
        }
      }
    }
    addItem({ product, quantity, selectedModifiers, note: note.trim() })
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border shrink-0">
        <button onClick={closeProduct} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400">
          <ArrowLeft size={18} />
        </button>
        <span className="text-white font-semibold">{product.name}</span>
        <span className="ml-auto text-gray-400 text-sm">{formatCurrency(product.price, currency)}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {(product.modifierGroups ?? []).map((group) => (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="font-semibold text-sm text-white">{group.name}</span>
              {group.required && <span className="text-xs text-gray-500 uppercase tracking-wide">Requerido</span>}
              {group.multiple && <span className="text-xs text-gray-500">Múltiple</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const active = selections[group.id]?.has(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggle(group, opt)}
                    className={`flex flex-col items-center px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      active ? 'bg-brand-blue border-brand-blue text-white' : 'bg-surface-card border-surface-border text-gray-200 hover:border-gray-500'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {opt.price > 0 && (
                      <span className={`text-xs mt-0.5 ${active ? 'text-blue-200' : 'text-gray-400'}`}>
                        +{formatCurrency(opt.price, currency)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {noteOpen && (
        <div className="px-4 pb-2 shrink-0">
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota especial..."
            rows={2}
            className="w-full bg-surface-input border border-surface-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-brand-blue"
          />
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3 border-t border-surface-border bg-surface-secondary shrink-0">
        <div className="flex items-center gap-2 bg-surface-card rounded-xl px-2 py-1.5">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><Minus size={14} /></button>
          <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><Plus size={14} /></button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1 h-10 bg-brand-blue hover:bg-blue-500 disabled:opacity-40 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
        >
          <span>Agregar</span>
          {totalPrice > 0 && <span className="opacity-80">{formatCurrency(totalPrice, currency)}</span>}
        </button>
        <button
          onClick={() => setNoteOpen((v) => !v)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${noteOpen || note ? 'border-brand-blue text-brand-blue' : 'border-surface-border text-gray-500 hover:text-gray-300'}`}
        >
          <MessageSquare size={16} />
        </button>
      </div>
    </div>
  )
}
