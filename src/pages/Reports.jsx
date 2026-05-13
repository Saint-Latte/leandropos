import { useState } from 'react'
import { ChevronDown, ChevronRight, BarChart2, Banknote, CreditCard, Smartphone, QrCode } from 'lucide-react'
import { formatCurrency, formatDate, formatTime, PAYMENT_METHODS } from '../lib/utils'
import useRegisterStore from '../store/registerStore'
import useSettingsStore from '../store/settingsStore'
import PinModal from '../components/common/PinModal'

export default function Reports() {
  const { getDayKeys, getDayRecord } = useRegisterStore()
  const { currency, adminPin } = useSettingsStore()
  const [expandedDay, setExpandedDay] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [unlocked, setUnlocked] = useState(false)

  const days = getDayKeys()

  if (!unlocked) {
    return (
      <PinModal
        title="Acceso a Reportes"
        subtitle="Solo el administrador puede ver el historial de ventas"
        correctPin={adminPin}
        onSuccess={() => setUnlocked(true)}
      />
    )
  }

  if (!days.length) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-gray-500 gap-2">
        <BarChart2 size={40} strokeWidth={1} />
        <p className="text-sm">Sin ventas registradas</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-surface">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-secondary shrink-0">
        <BarChart2 size={18} className="text-brand-blue" />
        <h1 className="font-bold text-base">Ventas</h1>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
        {days.map((day) => {
          const record = getDayRecord(day)
          const totals = calcTotals(record.orders)
          const isExpanded = expandedDay === day

          return (
            <div key={day}>
              {/* Day header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : day)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{formatDate(day + 'T12:00:00')}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{record.orders.length} órdenes</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatCurrency(totals.total, currency)}</p>
                  <div className="flex gap-2 justify-end mt-0.5">
                    {totals.cash > 0 && <span className="text-xs text-green-400">Ef {formatCurrency(totals.cash, currency)}</span>}
                    {totals.card > 0 && <span className="text-xs text-brand-blue">Tj {formatCurrency(totals.card, currency)}</span>}
                    {totals.transfer > 0 && <span className="text-xs text-purple-400">Tr {formatCurrency(totals.transfer, currency)}</span>}
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-gray-500 shrink-0" /> : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
              </button>

              {/* Day detail */}
              {isExpanded && (
                <div className="bg-surface-card/30">
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 gap-2 px-4 pt-3 pb-1">
                    <SummaryCard label="Efectivo" amount={totals.cash} currency={currency} color="text-green-400" />
                    <SummaryCard label="Tarjeta" amount={totals.card} currency={currency} color="text-brand-blue" />
                    <SummaryCard label="Transferencia" amount={totals.transfer} currency={currency} color="text-purple-400" />
                    <SummaryCard label="CoDi/QR" amount={totals.codi} currency={currency} color="text-brand-orange" />
                  </div>

                  {/* Cash sessions */}
                  {record.sessions.map((s) => (
                    <div key={s.id} className="mx-4 my-2 bg-surface-card rounded-xl px-3 py-2 text-xs space-y-0.5">
                      <div className="flex justify-between text-gray-400">
                        <span>Fondo inicial</span>
                        <span>{formatCurrency(s.openingAmount, currency)}</span>
                      </div>
                      {s.closingAmount != null && (
                        <div className="flex justify-between text-gray-400">
                          <span>Efectivo contado</span>
                          <span>{formatCurrency(s.closingAmount, currency)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500">
                        <span>{formatTime(s.openedAt)} – {s.closedAt ? formatTime(s.closedAt) : 'abierta'}</span>
                        {s.closeNote && <span className="text-gray-600 truncate ml-2">{s.closeNote}</span>}
                      </div>
                    </div>
                  ))}

                  {/* Orders list */}
                  <div className="divide-y divide-surface-border border-t border-surface-border mt-2">
                    {record.orders.map((order) => {
                      const isOrderExpanded = expandedOrder === order.id
                      return (
                        <div key={order.id}>
                          <button
                            onClick={() => setExpandedOrder(isOrderExpanded ? null : order.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors text-left"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">#{order.number}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ color: PAYMENT_METHODS[order.paymentMethod]?.color, backgroundColor: PAYMENT_METHODS[order.paymentMethod]?.color + '20' }}>
                                  {PAYMENT_METHODS[order.paymentMethod]?.label ?? order.paymentMethod}
                                </span>
                              </div>
                              {order.customerName && <p className="text-xs text-gray-500">{order.customerName}</p>}
                            </div>
                            <span className="text-sm font-bold text-white">{formatCurrency(order.total, currency)}</span>
                            <span className="text-xs text-gray-500">{formatTime(order.createdAt)}</span>
                          </button>
                          {isOrderExpanded && (
                            <div className="px-6 pb-2 space-y-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="text-xs">
                                  <div className="flex justify-between text-gray-300">
                                    <span>{item.quantity}× {item.product.name}</span>
                                    <span>{formatCurrency(item.totalPrice, currency)}</span>
                                  </div>
                                  {item.selectedModifiers.map((m, j) => (
                                    <p key={j} className="text-gray-500 pl-3">↳ {m.name}{m.price > 0 ? ` +${formatCurrency(m.price, currency)}` : ''}</p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryCard({ label, amount, currency, color }) {
  return (
    <div className="bg-surface-card rounded-xl px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-bold text-sm mt-0.5 ${color}`}>{formatCurrency(amount, currency)}</p>
    </div>
  )
}

function calcTotals(orders) {
  const t = { cash: 0, card: 0, transfer: 0, codi: 0, total: 0 }
  for (const o of orders) {
    t[o.paymentMethod] = (t[o.paymentMethod] ?? 0) + o.total
    t.total += o.total
  }
  return t
}
