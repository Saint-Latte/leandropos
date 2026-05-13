import { useState } from 'react'
import { X, Banknote, CreditCard, Smartphone, QrCode } from 'lucide-react'
import { formatCurrency, PAYMENT_METHODS } from '../../lib/utils'
import useOrderStore from '../../store/orderStore'
import useRegisterStore from '../../store/registerStore'

const QUICK_AMOUNTS = [20, 50, 100, 200, 500]

export default function PaymentModal({ currency, orderNumber, onClose, onSuccess }) {
  const { getTotals, completeOrder } = useOrderStore()
  const { recordOrder } = useRegisterStore()
  const { total } = getTotals()

  const [method, setMethod] = useState('cash')
  const [cashInput, setCashInput] = useState('')

  const cashReceived = parseFloat(cashInput) || 0
  const change = method === 'cash' ? Math.max(0, cashReceived - total) : 0
  const canConfirm = method !== 'cash' || cashReceived >= total

  const handleConfirm = () => {
    const order = completeOrder({ paymentMethod: method, cashReceived: cashReceived || total, orderNumber })
    recordOrder(order)
    onSuccess(order)
  }

  const METHODS = [
    { id: 'cash',     icon: Banknote,    label: 'Efectivo' },
    { id: 'card',     icon: CreditCard,  label: 'Tarjeta' },
    { id: 'transfer', icon: Smartphone,  label: 'Transferencia' },
    { id: 'codi',     icon: QrCode,      label: 'CoDi / QR' },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-surface-secondary w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-surface-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="font-bold text-base">Cobrar</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Total */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Total a cobrar</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(total, currency)}</p>
          </div>

          {/* Payment methods */}
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border font-medium text-sm transition-all ${
                  method === id
                    ? 'border-brand-blue bg-brand-blue/10 text-white'
                    : 'border-surface-border text-gray-400 hover:border-gray-500'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* Cash input */}
          {method === 'cash' && (
            <div className="space-y-3">
              <div className="bg-surface-input border border-surface-border rounded-xl px-4 py-2.5">
                <p className="text-xs text-gray-500 mb-1">Efectivo recibido</p>
                <input
                  type="number"
                  inputMode="decimal"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  placeholder={formatCurrency(total, currency)}
                  className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.filter((a) => a >= total || a === Math.ceil(total / 50) * 50).slice(0, 4).map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCashInput(String(amt))}
                    className="px-3 py-1.5 bg-surface-card rounded-lg text-sm text-gray-300 hover:bg-surface-hover transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  onClick={() => setCashInput(String(total))}
                  className="px-3 py-1.5 bg-surface-card rounded-lg text-sm text-gray-300 hover:bg-surface-hover transition-colors"
                >
                  Exacto
                </button>
              </div>

              {/* Change */}
              {cashReceived >= total && (
                <div className="flex justify-between items-center bg-brand-green/10 border border-brand-green/30 rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-brand-green">Cambio</span>
                  <span className="text-xl font-bold text-brand-green">{formatCurrency(change, currency)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm */}
        <div className="px-5 pb-5">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full h-12 bg-brand-blue hover:bg-blue-500 disabled:opacity-40 rounded-xl font-bold text-white transition-colors"
          >
            Confirmar pago
          </button>
        </div>
      </div>
    </div>
  )
}
