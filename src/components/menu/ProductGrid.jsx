import { formatCurrency, getCategoryColor } from '../../lib/utils'

export default function ProductGrid({ categories, products, selectedCategoryId, onProductClick, currency, searchQuery }) {
  const query = searchQuery?.trim().toLowerCase()

  // ── Search mode ─────────────────────────────────────────────────────────────
  if (query) {
    const results = products.filter((p) => p.name.toLowerCase().includes(query))
    return (
      <div className="flex-1 overflow-y-auto bg-surface p-3">
        {results.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
            Sin resultados para "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {results.map((product) => {
              const catIdx = categories.findIndex((c) => c.id === product.categoryId)
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  accentColor={getCategoryColor(catIdx)}
                  currency={currency}
                  onClick={() => onProductClick(product)}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Normal mode ─────────────────────────────────────────────────────────────
  const visibleCategories = selectedCategoryId === 'all'
    ? categories
    : categories.filter((c) => c.id === selectedCategoryId)

  return (
    <div className="flex-1 overflow-y-auto bg-surface p-3 space-y-5">
      {visibleCategories.map((cat) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id)
        if (!catProducts.length) return null
        const color = getCategoryColor(categories.indexOf(cat))
        return (
          <div key={cat.id}>
            {selectedCategoryId === 'all' && (
              <div className="flex items-center gap-2 mb-2.5 px-0.5">
                <span className="text-base leading-none">{cat.emoji}</span>
                <h2 className="text-white font-bold text-sm tracking-tight">{cat.name}</h2>
                <div className="flex-1 h-px ml-1" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {catProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  accentColor={color}
                  currency={currency}
                  onClick={() => onProductClick(product)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-gray-600 gap-2">
          <span className="text-4xl">☕</span>
          <p className="text-sm">Agrega productos en Menú</p>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, accentColor, currency, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col bg-surface-card rounded-2xl overflow-hidden
                 border border-surface-border
                 hover:border-opacity-60 hover:bg-surface-hover
                 active:scale-95 transition-all duration-100 text-left"
    >
      {/* Accent strip top */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accentColor }} />

      {/* Emoji / image */}
      <div className="w-full aspect-square flex items-center justify-center bg-surface-tertiary/50 pt-1">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl select-none leading-none">{product.emoji ?? '🍽️'}</span>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2 pb-3">
        <p className="text-white text-xs font-semibold leading-snug line-clamp-2 mb-1">{product.name}</p>
        <p className="text-xs font-bold" style={{ color: accentColor }}>
          {formatCurrency(product.price, currency)}
        </p>
      </div>
    </button>
  )
}
