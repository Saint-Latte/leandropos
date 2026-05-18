import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ChevronDown, ChevronRight, WifiOff, ClipboardList, XCircle } from 'lucide-react'
import api from '../api/polotab'
import usePolotabStore from '../store/polotabStore'
import useSettingsStore from '../store/settingsStore'
import { formatTime, formatCurrency } from '../lib/utils'
import PinModal from '../components/common/PinModal'

export default function Orders() {
  const { connected } = usePolotabStore()
  const { adminPin, currency } = useSettingsStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [voidTarget, setVoidTarget] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [voiding, setVoiding] = useState(null)

  const load = useCallback(async () => {
    if (!connected) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.getOrders({ limit: 50 })
      const open = (Array.isArray(data) ? data : []).filter(
        (o) => o.status === 'in_progress' || o.status === 'created' || o.status === 'open'
      )
      setOrders(open)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [connected])

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [load])

  const handleVoid = async () => {
    if (!voidTarget) return
    setVoiding(voidTarget)
    try {
      await api.voidOrder(voidTarget)
      setOrders((prev) => prev.filter((o) => o.id !== voidTarget))
    } catch (err) {
      setError(`No se pudo anular: ${err.message}`)
    }
    setVoiding(null)
    setVoidTarget(null)
  }

  if (!connected) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-3 text-gray-600 p-8">
        <WifiOff size={40} strokeWidth={1} />
        <p className="font-semibold text-white text-sm">Polotab desconectado</p>
        <p className="text-xs text-center">Conecta tu cuenta en Configuración para ver las comandas en vivo</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col flex-1 overflow-hidden bg-surface">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-secondary shrink-0">
          <ClipboardList size={18} className="text-brand-blue" />
          <h1 className="font-bold text-base">Comandas abiertas</h1>
          <span className="ml-1 bg-brand-blue/20 text-brand-blue text-xs font-bold px-2 py-0.5 rounded-full">
            {orders.length}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {lastRefresh && (
              <span className="text-xs text-gray-600">
                {formatTime(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={load}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-card text-gray-400 transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
          {orders.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-600 gap-2">
              <ClipboardList size={32} strokeWidth={1} />
              <p className="text-sm">Sin comandas abiertas</p>
            </div>
          )}

          {orders.map((order) => {
            const isExpanded = expanded === order.id
            const itemCount = order.orderItems?.length ?? 0
            const total = order.totalAmount ?? order.subtotalAmount ?? 0

            return (
              <div key={order.id}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-hover transition-colors text-left"
                >
                  {/* Order number + badge */}
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/15 flex items-center justify-center shrink-0">
                    <span className="text-brand-blue font-bold text-xs">#{order.dayOrderNumber ?? '?'}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">
                      {order.customerName || 'Sin nombre'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                      {order.createdAt && ` · ${formatTime(order.createdAt)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {total > 0 && (
                      <span className="text-white font-bold text-sm">{formatCurrency(total, currency)}</span>
                    )}
                    <StatusBadge status={order.status} />
                    {isExpanded
                      ? <ChevronDown size={14} className="text-gray-500" />
                      : <ChevronRight size={14} className="text-gray-500" />
                    }
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 bg-surface-card/30">
                    <div className="space-y-1.5 mb-3">
                      {(order.orderItems ?? []).map((oi, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <div>
                            <span className="text-white">
                              {oi.quantity}× {oi.item?.name ?? oi.itemId}
                            </span>
                            {(oi.orderItemModifiers ?? []).map((m, j) => (
                              <p key={j} className="text-xs text-gray-500 pl-3">
                                + {m.item?.name ?? m.itemId}
                              </p>
                            ))}
                            {oi.note && <p className="text-xs text-gray-600 pl-3 italic">{oi.note}</p>}
                          </div>
                          {oi.totalAmount > 0 && (
                            <span className="text-gray-400 text-xs">{formatCurrency(oi.totalAmount, currency)}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setVoidTarget(order.id)}
                      disabled={voiding === order.id}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors disabled:opacity-40"
                    >
                      <XCircle size={13} />
                      {voiding === order.id ? 'Anulando...' : 'Anular comanda'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {voidTarget && (
        <PinModal
          title="Anular comanda"
          subtitle="Solo el administrador puede anular pedidos"
          correctPin={adminPin}
          onSuccess={handleVoid}
          onCancel={() => setVoidTarget(null)}
        />
      )}
    </>
  )
}

function StatusBadge({ status }) {
  const map = {
    in_progress: { label: 'En curso', cls: 'bg-brand-amber/20 text-brand-amber' },
    created:     { label: 'Creado',   cls: 'bg-brand-blue/20 text-brand-blue' },
    open:        { label: 'Abierto',  cls: 'bg-brand-green/20 text-brand-green' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-surface-border text-gray-500' }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.label}
    </span>
  )
}
