export const formatCurrency = (amount, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount ?? 0)

export const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export const todayKey = () => new Date().toISOString().slice(0, 10) // YYYY-MM-DD

export const generateId = () => crypto.randomUUID()

export const PAYMENT_METHODS = {
  cash: { label: 'Efectivo', color: '#22c55e' },
  card: { label: 'Tarjeta', color: '#3b82f6' },
  transfer: { label: 'Transferencia', color: '#a855f7' },
  codi: { label: 'CoDi / QR', color: '#f97316' },
}

export const CATEGORY_COLORS = [
  '#f97316','#3b82f6','#22c55e','#a855f7','#ef4444',
  '#06b6d4','#eab308','#ec4899','#ffffff','#f59e0b',
]

export const getCategoryColor = (idx) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
