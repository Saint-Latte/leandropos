import { useState } from 'react'
import { ShoppingBag, Send, X, ChevronDown, Trash2, WifiOff, CheckCircle, Loader } from 'lucide-react'
import CategorySidebar from '../components/menu/CategorySidebar'
import ProductGrid from '../components/menu/ProductGrid'
import ModifierPanel from '../components/menu/ModifierPanel'
import useMenuStore from '../store/menuStore'
import useOrderStore from '../store/orderStore'
import useSettingsStore from '../store/settingsStore'
import usePolotabStore from '../store/polotabStore'
import { formatCurrency } from '../lib/utils'

export default function Waiter() {
  const { categories, products } = useMenuStore()
  const { current, removeItem, updateQuantity, resetOrder, setCustomerName } = useOrderStore()
  const { selectedProduct } = useOrderStore()
  const { currency, employees } = useSettingsStore()
  const { connected, submitOrderToPolotab } = usePolotabStore()

  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mesa, setMesa] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(employees?.[0]?.name ?? '')

  const items = current.items
  const total = items.reduce((s, i) => s + i.totalPrice, 0)

  const handleProductClick = (product) => {
    if (!product.modifierGroups?.length) {
      useOrderStore.getState().addItem({ product })
    } else {
      useOrderStore.getState().openProduct(product)
    }
  }

  const handleSend = async () => {
    if (!items.length) return
    setSending(true)

    const order = {
      items,
      customerName: mesa ? `Mesa ${mesa}` : selectedEmployee || 'Comanda',
    }

    await submitOrderToPolotab(order)

    setSending(false)
    setSent(true)
    setShowCart(false)
    resetOrder()
    setMesa('')

    setTimeout(() => setSent(false), 3000)
  }

  // Success flash
  if (sent) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 bg-surface">
        <div className="w-20 h-20 rounded-full bg-brand-green/20 flex items-center justify-center">
          <CheckCircle size={40} className="text-brand-green" />
        </div>
        <p className="font-bold text-white text-xl">¡Comanda enviada!</p>
        <p className="text-gray-500 text-sm">La tablet imprimirá el pedido</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-surface">
      {/* Header */}
      <div className="bg-surface-secondary border-b border-surface-border px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          {/* Mesa input */}
          <div className="flex items-center gap-1.5 bg-surface-input border border-surface-border rounded-xl px-3 h-9 flex-1">
            <span className="text-gray-500 text-xs font-semibold">Mesa</span>
            <input
              type="text"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              placeholder="1, 2, Terraza..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Employee selector */}
          {employees?.length > 0 && (
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="h-9 bg-surface-input border border-surface-border rounded-xl px-2 text-white text-xs font-semibold focus:outline-none"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.name}>{e.name}</option>
              ))}
            </select>
          )}

          {/* Polotab status dot */}
          <div className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-brand-green' : 'bg-red-500'}`}
            title={connected ? 'Polotab conectado' : 'Sin conexión Polotab'} />
        </div>
      </div>

      {/* Modifier panel or product grid */}
      {selectedProduct ? (
        <ModifierPanel product={selectedProduct} currency={currency} />
      ) : (
        <>
          <CategorySidebar
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={(id) => { setSelectedCategoryId(id); setSearchQuery('') }}
          />
          <ProductGrid
            categories={categories}
            products={products}
            selectedCategoryId={selectedCategoryId}
            onProductClick={handleProductClick}
            currency={currency}
            searchQuery={searchQuery}
          />
        </>
      )}

      {/* Bottom cart bar */}
      {items.length > 0 && !selectedProduct && (
        <div
          className="shrink-0 bg-surface-secondary border-t border-surface-border px-3 py-2.5 flex items-center gap-3 cursor-pointer"
          onClick={() => setShowCart(true)}
        >
          <div className="w-8 h-8 rounded-xl bg-brand-blue/20 flex items-center justify-center relative">
            <ShoppingBag size={16} className="text-brand-blue" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-blue rounded-full text-white text-[9px] font-bold flex items-center justify-center">
              {items.length}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-white text-xs font-semibold">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
            <p className="text-gray-500 text-[10px]">Toca para revisar</p>
          </div>
          <span className="text-white font-bold">{formatCurrency(total, currency)}</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="relative bg-surface-secondary rounded-t-2xl border-t border-surface-border max-h-[80dvh] flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border shrink-0">
              <div>
                <h2 className="font-bold text-base">Comanda</h2>
                {mesa && <p className="text-xs text-brand-blue">Mesa {mesa}</p>}
              </div>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-hover text-gray-400">
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="bg-surface-card rounded-xl px-3 py-2.5 border border-surface-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{item.product.name}</p>
                      {item.selectedModifiers?.map((m, i) => (
                        <p key={i} className="text-gray-500 text-xs">+ {m.name}</p>
                      ))}
                    </div>
                    <span className="text-white text-sm font-bold shrink-0">{formatCurrency(item.totalPrice, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-surface-border/50">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-surface-hover text-gray-400 font-bold text-sm flex items-center justify-center">−</button>
                      <span className="text-white text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-surface-hover text-gray-400 font-bold text-sm flex items-center justify-center">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-600 hover:text-red-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-surface-border shrink-0 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Total</span>
                <span className="text-white font-bold text-lg">{formatCurrency(total, currency)}</span>
              </div>
              {!connected && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <WifiOff size={12} /> Sin conexión Polotab — conecta en Configuración
                </p>
              )}
              <button
                onClick={handleSend}
                disabled={sending || !connected}
                className="w-full h-12 rounded-2xl font-bold text-base text-white
                           bg-gradient-to-r from-indigo-500 to-violet-600
                           hover:from-indigo-400 hover:to-violet-500
                           shadow-lg shadow-indigo-900/40
                           active:scale-[0.97] transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {sending
                  ? <><Loader size={18} className="animate-spin" /> Enviando...</>
                  : <><Send size={18} /> Enviar comanda</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
