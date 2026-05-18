import { useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, BarChart2, BookOpen, Settings, DollarSign, Tablet, ClipboardList } from 'lucide-react'

const TABS = [
  { path: '/',         icon: ShoppingCart,  label: 'Comanda'  },
  { path: '/waiter',   icon: Tablet,        label: 'Mesero'   },
  { path: '/orders',   icon: ClipboardList, label: 'Comandas' },
  { path: '/register', icon: DollarSign,    label: 'Caja'     },
  { path: '/settings', icon: Settings,      label: 'Config'   },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="shrink-0 bg-surface-secondary border-t border-surface-border px-2 py-1.5">
      <div className="flex gap-1">
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 rounded-xl transition-all ${
                active
                  ? 'bg-surface-card text-brand-blue'
                  : 'text-gray-600 hover:text-gray-400 hover:bg-surface-card/50'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-brand-blue' : ''}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
