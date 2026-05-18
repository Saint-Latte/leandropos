import { useState } from 'react'
import { Search, X } from 'lucide-react'
import CategorySidebar from '../components/menu/CategorySidebar'
import ProductGrid from '../components/menu/ProductGrid'
import ModifierPanel from '../components/menu/ModifierPanel'
import OrderPanel from '../components/order/OrderPanel'
import PaymentModal from '../components/order/PaymentModal'
import TicketModal from '../components/common/TicketModal'
import useMenuStore from '../store/menuStore'
import useOrderStore from '../store/orderStore'
import useSettingsStore from '../store/settingsStore'
import useRegisterStore from '../store/registerStore'

export default function POS() {
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [showPayment, setShowPayment] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { categories, products } = useMenuStore()
  const { selectedProduct } = useOrderStore()
  const { currency } = useSettingsStore()
  const { isOpen, dailyRecords } = useRegisterStore()

  const todayKey = new Date().toISOString().slice(0, 10)
  const todayOrders = dailyRecords[todayKey]?.orders ?? []
  const nextOrderNumber = todayOrders.length + 1

  const handleProductClick = (product) => {
    if (!product.modifierGroups?.length) {
      useOrderStore.getState().addItem({ product })
    } else {
      useOrderStore.getState().openProduct(product)
    }
  }

  return (
    <>
      {!isOpen() && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-1.5 text-center text-xs text-yellow-400 shrink-0 font-medium">
          Caja cerrada — abre la caja antes de cobrar
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: categories + products */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {selectedProduct ? (
            <ModifierPanel product={selectedProduct} currency={currency} />
          ) : (
            <>
              {/* Category pills */}
              <CategorySidebar
                categories={categories}
                selectedId={selectedCategoryId}
                onSelect={(id) => { setSelectedCategoryId(id); setSearchQuery('') }}
              />

              {/* Search */}
              <div className="px-3 pt-2 pb-1 shrink-0">
                <div className="flex items-center gap-2 bg-surface-card border border-surface-border rounded-xl px-3 h-9">
                  <Search size={14} className="text-gray-600 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar producto..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Products */}
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
        </div>

        {/* Right: order panel */}
        <div className="w-[270px] shrink-0 flex flex-col border-l border-surface-border">
          <OrderPanel currency={currency} onCheckout={() => setShowPayment(true)} />
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          currency={currency}
          orderNumber={nextOrderNumber}
          onClose={() => setShowPayment(false)}
          onSuccess={(order) => { setShowPayment(false); setCompletedOrder(order) }}
        />
      )}

      {completedOrder && (
        <TicketModal order={completedOrder} onClose={() => setCompletedOrder(null)} />
      )}
    </>
  )
}
