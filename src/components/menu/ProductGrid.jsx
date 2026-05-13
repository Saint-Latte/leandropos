import { formatCurrency, getCategoryColor } from '../../lib/utils'

export default function ProductGrid({ categories, products, selectedCategoryId, onProductClick, currency }) {
  const visibleCategories = selectedCategoryId === 'all'
    ? categories
    : categories.filter((c) => c.id === selectedCategoryId)

  return (
    <div className="flex-1 overflow-y-auto bg-surface p-3">
      {visibleCategories.map((cat, catIdx) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id)
        if (!catProducts.length) return null
        const color = getCategoryColor(categories.indexOf(cat))
        return (
          <div key={cat.id} className="mb-5">
            {selectedCategoryId === 'all' && (
              <h2 className="text-white font-semibold text-sm mb-2 px-1">{cat.emoji} {cat.name}</h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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
        <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
          No hay productos — agrégalos en Menú
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, accentColor, currency, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col bg-surface-card rounded-xl overflow-hidden hover:bg-surface-hover active:scale-95 transition-all text-left"
    >
      <div className="w-full aspect-[4/3] bg-surface-hover flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl select-none">
            {product.emoji ?? '🍽️'}
          </span>
        )}
      </div>
      <div className="px-2.5 pt-2 pb-3">
        <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{product.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{formatCurrency(product.price, currency)}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }} />
    </button>
  )
}
