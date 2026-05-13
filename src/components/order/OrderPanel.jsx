import { Layers, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import useOrderStore from '../../store/orderStore'

export default function OrderPanel({ currency, onCheckout }) {
  const { current, removeItem, updateQuantity, setCustomerName, getTotals } = useOrderStore()
  const { items, customerName } = current
  const { total } = getTotals()

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-surface-border">
      {/* Customer name */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-border shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-surface-input rounded-lg px-2.5 h-8">
          <span className="text-gray-500 text-xs">👤</span>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nombre cliente"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
            <Layers size={32} strokeWidth={1} />
            <p className="text-sm">Orden vacía</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {items.map((item, idx) => (
              <OrderItem
                key={item.id}
                item={item}
                index={idx + 1}
                currency={currency}
                onRemove={() => removeItem(item.id)}
                onDecrement={() => updateQuantity(item.id, -1)}
                onIncrement={() => updateQuantity(item.id, 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-surface-border px-3 py-3 space-y-2 shrink-0">
        <div className="flex justify-between text-base font-bold text-white">
          <span>Total</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-11 bg-brand-blue hover:bg-blue-500 disabled:opacity-30 rounded-xl font-bold text-sm text-white transition-colors"
        >
          Cobrar
        </button>
      </div>
    </div>
  )
}

function OrderItem({ item, index, currency, onRemove, onDecrement, onIncrement }) {
  return (
    <div className="bg-surface-card rounded-xl px-3 py-2.5 group">
      <div className="flex items-start gap-2">
        <span className="text-xs text-gray-500 mt-0.5 w-4 shrink-0">{index}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white truncate">{item.product.name}</span>
            <span className="text-sm font-semibold text-white shrink-0">{formatCurrency(item.totalPrice, currency)}</span>
          </div>
          {item.selectedModifiers.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.selectedModifiers.map((m, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-400">
                  <span>↳ {m.name}</span>
                  {m.price > 0 && <span>+{formatCurrency(m.price, currency)}</span>}
                </div>
              ))}
            </div>
          )}
          {item.note && <p className="text-xs text-gray-500 mt-1">📝 {item.note}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-border opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <button onClick={onDecrement} className="w-6 h-6 rounded-lg bg-surface-hover text-gray-400 hover:text-white text-xs flex items-center justify-center">−</button>
          <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
          <button onClick={onIncrement} className="w-6 h-6 rounded-lg bg-surface-hover text-gray-400 hover:text-white text-xs flex items-center justify-center">+</button>
        </div>
        <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
