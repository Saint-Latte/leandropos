import { X, Printer, CheckCircle, MessageCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatTime, PAYMENT_METHODS } from '../../lib/utils'
import useSettingsStore from '../../store/settingsStore'
import { buildWhatsAppTicket } from '../../lib/telegram'

export default function TicketModal({ order, onClose }) {
  const { businessName, businessSubtitle, address, currency } = useSettingsStore()

  const printTicket = () => window.print()

  const shareWhatsApp = () => {
    const text = buildWhatsAppTicket(order, businessName, address)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-secondary w-full max-w-sm rounded-2xl border border-surface-border shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <h2 className="font-bold text-base">Venta registrada</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div id="ticket-print" className="bg-surface-card rounded-xl p-4 font-mono text-xs space-y-1">
            <div className="text-center space-y-0.5 mb-3">
              <p className="font-bold text-sm text-white">{businessName}</p>
              {businessSubtitle && <p className="text-gray-400">{businessSubtitle}</p>}
              {address && <p className="text-gray-400">{address}</p>}
            </div>

            <div className="border-t border-surface-border pt-2 space-y-0.5 mb-2">
              <p className="text-gray-400">Ticket #{order.number ?? order.id?.slice(0, 8)}</p>
              {order.customerName && <p className="text-gray-400">Cliente: {order.customerName}</p>}
              <p className="text-gray-400">{formatDate(order.createdAt)} {formatTime(order.createdAt)}</p>
              <p className="text-gray-400">Pago: {PAYMENT_METHODS[order.paymentMethod]?.label ?? order.paymentMethod}</p>
            </div>

            <div className="border-t border-surface-border pt-2 space-y-2 mb-2">
              {(order.items ?? []).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-white font-semibold">
                    <span>{item.quantity}× {item.product.name}</span>
                    <span>{formatCurrency(item.product.price * item.quantity, currency)}</span>
                  </div>
                  {item.selectedModifiers.map((m, j) => (
                    <div key={j} className="flex justify-between text-gray-400 pl-4">
                      <span>↳ {m.name}</span>
                      {m.price > 0 && <span>+{formatCurrency(m.price * item.quantity, currency)}</span>}
                    </div>
                  ))}
                  {item.note && <p className="text-gray-500 pl-4">📝 {item.note}</p>}
                </div>
              ))}
            </div>

            <div className="border-t border-surface-border pt-2 space-y-0.5">
              <div className="flex justify-between text-white font-bold text-sm">
                <span>Total</span>
                <span>{formatCurrency(order.total, currency)}</span>
              </div>
              {order.paymentMethod === 'cash' && order.cashReceived > order.total && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>Recibido</span>
                    <span>{formatCurrency(order.cashReceived, currency)}</span>
                  </div>
                  <div className="flex justify-between text-green-400 font-semibold">
                    <span>Cambio</span>
                    <span>{formatCurrency(order.change, currency)}</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-center text-gray-500 mt-3 pt-2 border-t border-surface-border">¡Gracias por tu visita!</p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-surface-border shrink-0 space-y-2">
          <button
            onClick={shareWhatsApp}
            className="w-full h-11 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-sm text-white transition-colors"
          >
            <MessageCircle size={18} />
            Mandar por WhatsApp
          </button>
          <div className="flex gap-2">
            <button
              onClick={printTicket}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-surface-card hover:bg-surface-hover border border-surface-border rounded-xl font-semibold text-sm text-white"
            >
              <Printer size={18} />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-11 flex items-center justify-center bg-brand-blue hover:bg-blue-500 rounded-xl font-semibold text-sm text-white"
            >
              Nueva orden
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
