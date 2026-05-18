import { getCategoryColor } from '../../lib/utils'

export default function CategorySidebar({ categories, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 px-3 py-2.5 overflow-x-auto no-scrollbar shrink-0 bg-surface-secondary border-b border-surface-border">
      <CategoryPill
        label="Todo"
        emoji="✦"
        active={selectedId === 'all'}
        color="#6366f1"
        onClick={() => onSelect('all')}
      />
      {categories.map((cat, idx) => (
        <CategoryPill
          key={cat.id}
          label={cat.name}
          emoji={cat.emoji ?? '📦'}
          active={selectedId === cat.id}
          color={getCategoryColor(idx)}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </div>
  )
}

function CategoryPill({ label, emoji, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all shrink-0 border ${
        active
          ? 'text-white'
          : 'text-gray-500 border-surface-border hover:text-gray-200 hover:border-gray-500'
      }`}
      style={active
        ? { backgroundColor: color + '25', borderColor: color + '80' }
        : {}}
    >
      <span className="text-sm leading-none">{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
