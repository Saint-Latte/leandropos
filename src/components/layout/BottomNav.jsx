import { useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, BarChart2, BookOpen, Settings, DollarSign } from 'lucide-react'

const TABS = [
  { path: '/',         icon: ShoppingCart, label: 'Comanda' },
  { path: '/register', icon: DollarSign,   label: 'Caja' },
  { path: '/reports',  icon: BarChart2,    label: 'Ventas' },
  { path: '/menu',     icon: BookOpen,     label: 'Menú' },
  { path: '/settings', icon: Settings,     label: 'Config' },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="flex shrink-0 bg-surface-secondary border-t border-surface-border">
      {TABS.map(({ path, icon: Icon, label }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? 'text-brand-blue' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
