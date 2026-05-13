import { useState } from 'react'
import { DollarSign, Lock, Unlock, TrendingUp, Banknote, CreditCard, Smartphone, QrCode } from 'lucide-react'
import { formatCurrency, formatTime, todayKey, PAYMENT_METHODS } from '../lib/utils'
import useRegisterStore from '../store/registerStore'
import useSettingsStore from '../store/settingsStore'
import { sendTelegram, buildSessionOpenMessage, buildSessionCloseMessage } from '../lib/telegram'

export default function Register() {
  const { session, isOpen, openSession, closeSession, getDayRecord } = useRegisterStore()
  const { currency, telegramEnabled, telegramToken, telegramChatId, businessName } = useSettingsStore()
  const [openAmount, setOpenAmount] = useState('')
  const [closeAmount, setCloseAmount] = useState('')
  const [note, setNote] = useState('')

  const today = todayKey()
  const dayRecord = getDayRecord(today)

  // Current session totals
  const sessionOrders = dayRecord.orders.filter((o) =>
    session ? o.createdAt >= session.openedAt : false
  )
  const totals = calcTotals(sessionOrders)

  const handleOpen = () => {
    const s = { openingAmount: parseFloat(openAmount) || 0, note }
    openSession(s)
    if (telegramEnabled) {
      const opened = { ...s, openedAt: new Date().toISOString() }
      sendTelegram(telegramToken, telegramChatId, buildSessionOpenMessage(opened, businessName))
    }
    setOpenAmount('')
    setNote('')
  }

  const handleClose = () => {
    const closingAmount = parseFloat(closeAmount) || 0
    closeSession({ closingAmount, note })
    if (telegramEnabled && session) {
      const closed = { ...session, closedAt: new Date().toISOString(), closingAmount }
      sendTelegram(telegramToken, telegramChatId, buildSessionCloseMessage(closed, sessionOrders, businessName))
    }
    setCloseAmount('')
    setNote('')
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-surface">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-secondary shrink-0">
        <DollarSign size={18} className="text-brand-green" />
        <h1 className="font-bold text-base">Caja</h1>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${isOpen() ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isOpen() ? 'Abierta' : 'Cerrada'}
        </span>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">

        {!isOpen() ? (
          /* Open session */
          <div className="bg-surface-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Unlock size={18} className="text-brand-green" />
              <h2 className="font-semibold">Abrir caja</h2>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fondo inicial</label>
              <input
                type="number"
                inputMode="decimal"
                value={openAmount}
                onChange={(e) => setOpenAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nota (opcional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Turno mañana..."
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>
            <button onClick={handleOpen} className="w-full h-11 bg-brand-green hover:bg-green-400 rounded-xl font-bold text-sm text-white transition-colors">
              Abrir caja
            </button>
          </div>
        ) : (
          /* Session summary */
          <>
            <div className="bg-surface-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Sesión actual</h2>
                <span className="text-xs text-gray-500">Abierta {formatTime(session.openedAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fondo inicial</span>
                <span className="text-white font-semibold">{formatCurrency(session.openingAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Órdenes</span>
                <span className="text-white font-semibold">{sessionOrders.length}</span>
              </div>
            </div>

            {/* Totals by payment method */}
            <div className="bg-surface-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-blue" />
                <h2 className="font-semibold">Ventas del turno</h2>
              </div>
              <TotalRow icon={Banknote} label="Efectivo" amount={totals.cash} currency={currency} color="text-green-400" />
              <TotalRow icon={CreditCard} label="Tarjeta" amount={totals.card} currency={currency} color="text-brand-blue" />
              <TotalRow icon={Smartphone} label="Transferencia" amount={totals.transfer} currency={currency} color="text-purple-400" />
              <TotalRow icon={QrCode} label="CoDi / QR" amount={totals.codi} currency={currency} color="text-brand-orange" />
              <div className="border-t border-surface-border pt-2 flex justify-between font-bold text-white">
                <span>Total</span>
                <span>{formatCurrency(totals.total, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Efectivo en caja</span>
                <span className="text-white font-semibold">{formatCurrency(session.openingAmount + totals.cash, currency)}</span>
              </div>
            </div>

            {/* Close session */}
            <div className="bg-surface-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-red-400" />
                <h2 className="font-semibold">Cerrar caja</h2>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Efectivo contado</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={closeAmount}
                  onChange={(e) => setCloseAmount(e.target.value)}
                  placeholder={formatCurrency(session.openingAmount + totals.cash, currency)}
                  className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-brand-blue"
                />
              </div>
              {closeAmount && (
                <div className={`flex justify-between text-sm font-semibold rounded-xl px-4 py-2 ${
                  parseFloat(closeAmount) >= session.openingAmount + totals.cash
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  <span>Diferencia</span>
                  <span>{formatCurrency(parseFloat(closeAmount) - (session.openingAmount + totals.cash), currency)}</span>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nota (opcional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Observaciones..."
                  className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue"
                />
              </div>
              <button
                onClick={handleClose}
                className="w-full h-11 bg-red-500 hover:bg-red-400 rounded-xl font-bold text-sm text-white transition-colors"
              >
                Cerrar caja
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TotalRow({ icon: Icon, label, amount, currency, color }) {
  if (!amount) return null
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Icon size={15} className={color} />
        <span className="text-gray-400">{label}</span>
      </div>
      <span className="text-white font-medium">{formatCurrency(amount, currency)}</span>
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
