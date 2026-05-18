import { ShoppingBag, Trash2, Layers } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import useOrderStore from '../../store/orderStore'

export default function OrderPanel({ currency, onCheckout }) {
  const { current, removeItem, updateQuantity, setCustomerName, getTotals } = useOrderStore()
  const { items, customerName } = current
  const { total } = getTotals()

  return (
    <div className="flex flex-col h-full bg-surface-secondary">
      {/* Customer name */}
      <div className="px-3 py-2.5 border-b border-surface-border shrink-0">
        <div className="flex items-center gap-2 bg-surface-input border border-surface-border rounded-xl px-3 h-9">
          <span className="text-gray-600 text-xs">👤</span>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nombre cliente"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-2">
            <Layers size={28} strokeWidth={1.2} />
            <p className="text-xs">Orden vacía</p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
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
      <div className="border-t border-surface-border px-3 py-3 space-y-2.5 shrink-0">
        {items.length > 0 && (
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
            <span className="text-white font-bold text-lg">{formatCurrency(total, currency)}</span>
          </div>
        )}
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full h-12 rounded-2xl font-bold text-base text-white
                     bg-gradient-to-r from-indigo-500 to-violet-600
                     hover:from-indigo-400 hover:to-violet-500
                     shadow-lg shadow-indigo-900/40
                     active:scale-[0.97] transition-all
                     disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none
                     flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          Cobrar
        </button>
      </div>
    </div>
  )
}

function OrderItem({ item, index, currency, onRemove, onDecrement, onIncrement }) {
  return (
    <div className="bg-surface-card rounded-xl px-3 py-2.5 border border-surface-border">
      {/* Product + price */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{item.product.name}</p>
          {item.selectedModifiers?.length > 0 && (
            <div className="mt-0.5 space-y-0">
              {item.selectedModifiers.map((m, i) => (
                <p key={i} className="text-gray-600 text-[10px] leading-tight">
                  + {m.name}{m.price > 0 ? ` $${m.price}` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
        <span className="text-white text-xs font-bold shrink-0">{formatCurrency(item.totalPrice, currency)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-surface-border/60">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDecrement}
            className="w-6 h-6 rounded-lg bg-surface-hover text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition-colors"
          >−</button>
          <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
          <button
            onClick={onIncrement}
            className="w-6 h-6 rounded-lg bg-surface-hover text-gray-400 hover:text-white text-sm font-bold flex items-center justify-center transition-colors"
          >+</button>
        </div>
        <button
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
