import { getCategoryColor } from '../../lib/utils'

export default function CategorySidebar({ categories, selectedId, onSelect, productCounts }) {
  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-surface-border overflow-y-auto no-scrollbar">
      <button
        onClick={() => onSelect('all')}
        className={`py-3 px-2 text-xs font-semibold text-center border-b border-surface-border transition-colors ${
          selectedId === 'all' ? 'text-white bg-surface-hover' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        Todo
      </button>
      {categories.map((cat, idx) => {
        const color = getCategoryColor(idx)
        const active = selectedId === cat.id
        const count = productCounts?.[cat.id] ?? 0
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`relative flex flex-col items-center justify-center py-3 px-1 text-center transition-colors ${
              active ? 'bg-surface-hover text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xl mb-0.5">{cat.emoji ?? '📦'}</span>
            <span className="text-[10px] font-medium leading-tight line-clamp-2">{cat.name}</span>
            <div
              className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
              style={{ backgroundColor: active ? color : 'transparent' }}
            />
          </button>
        )
      })}
    </div>
  )
}
