import { useState } from 'react'
import { DollarSign, Lock, Unlock, TrendingUp, Banknote, CreditCard, Smartphone, QrCode, MinusCircle, Trash2, PlusCircle } from 'lucide-react'
import { formatCurrency, formatTime, todayKey, PAYMENT_METHODS } from '../lib/utils'
import useRegisterStore from '../store/registerStore'
import useSettingsStore from '../store/settingsStore'
import { sendTelegram, buildSessionOpenMessage, buildSessionCloseMessage, buildArqueoMessage } from '../lib/telegram'
import PinModal from '../components/common/PinModal'
import ArqueoCard from '../components/common/ArqueoCard'

export default function Register() {
  const { session, isOpen, openSession, closeSession, getDayRecord, recordEgreso, deleteEgreso } = useRegisterStore()
  const { currency, telegramEnabled, telegramToken, telegramChatId, businessName, adminPin, employees } = useSettingsStore()
  const [openAmount, setOpenAmount] = useState('')
  const [closeAmount, setCloseAmount] = useState('')
  const [note, setNote] = useState('')
  const [egresoAmount, setEgresoAmount] = useState('')
  const [egresoConcept, setEgresoConcept] = useState('')
  const [showEgreso, setShowEgreso] = useState(false)
  const [pinAction, setPinAction] = useState(null) // 'open' | 'close' | {type:'egreso',id}

  const today = todayKey()
  const dayRecord = getDayRecord(today)
  const egresos = dayRecord.egresos ?? []
  const totalEgresos = egresos.reduce((s, e) => s + e.amount, 0)

  const sessionOrders = dayRecord.orders.filter((o) =>
    session ? o.createdAt >= session.openedAt : false
  )
  const totals = calcTotals(sessionOrders)
  const efectivoEnCaja = (session?.openingAmount ?? 0) + totals.cash - totalEgresos

  const execOpen = (employee) => {
    const s = { openingAmount: parseFloat(openAmount) || 0, note, employeeName: employee?.name ?? '' }
    openSession(s)
    if (telegramEnabled) {
      const opened = { ...s, openedAt: new Date().toISOString() }
      sendTelegram(telegramToken, telegramChatId, buildSessionOpenMessage(opened, businessName))
    }
    setOpenAmount('')
    setNote('')
  }

  const execClose = (employee) => {
    const closingAmount = parseFloat(closeAmount) || 0
    closeSession({ closingAmount, note, employeeName: employee?.name ?? '' })
    if (telegramEnabled && session) {
      const closed = { ...session, closedAt: new Date().toISOString(), closingAmount, employeeName: employee?.name ?? session.employeeName }
      sendTelegram(telegramToken, telegramChatId, buildSessionCloseMessage(closed, sessionOrders, egresos, businessName))
    }
    setCloseAmount('')
    setNote('')
  }

  const handleEgreso = () => {
    const amount = parseFloat(egresoAmount)
    if (!amount || amount <= 0) return
    const egreso = recordEgreso({ amount, concept: egresoConcept })
    if (telegramEnabled) {
      sendTelegram(telegramToken, telegramChatId,
        `💸 <b>Egreso — ${businessName}</b>\n$${egreso.amount} — ${egreso.concept}\n🕐 ${formatTime(egreso.createdAt)}`
      )
    }
    setEgresoAmount('')
    setEgresoConcept('')
    setShowEgreso(false)
  }

  return (
    <>
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
          <div className="bg-surface-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Unlock size={18} className="text-brand-green" />
              <h2 className="font-semibold">Abrir caja</h2>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fondo inicial</label>
              <input
                type="number" inputMode="decimal" value={openAmount}
                onChange={(e) => setOpenAmount(e.target.value)} placeholder="0.00"
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-brand-blue"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nota (opcional)</label>
              <input
                type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Turno mañana..."
                className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>
            <button onClick={() => setPinAction('open')} className="w-full h-11 bg-brand-green hover:bg-green-400 rounded-xl font-bold text-sm text-white transition-colors">
              Abrir caja
            </button>
          </div>
        ) : (
          <>
            {/* Session summary */}
            <div className="bg-surface-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Sesión actual</h2>
                  {session.employeeName && <p className="text-xs text-brand-blue mt-0.5">{session.employeeName}</p>}
                </div>
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

            {/* Totals */}
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
                <span>Total ventas</span>
                <span>{formatCurrency(totals.total, currency)}</span>
              </div>
              {totalEgresos > 0 && (
                <div className="flex justify-between text-sm text-red-400 font-medium">
                  <span>Egresos</span>
                  <span>- {formatCurrency(totalEgresos, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm bg-surface-input rounded-xl px-3 py-2">
                <span className="text-gray-400">Efectivo en caja</span>
                <span className="text-white font-bold">{formatCurrency(efectivoEnCaja, currency)}</span>
              </div>
            </div>

            {/* Egresos */}
            <div className="bg-surface-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MinusCircle size={16} className="text-red-400" />
                  <h2 className="font-semibold">Egresos</h2>
                </div>
                <button
                  onClick={() => setShowEgreso(!showEgreso)}
                  className="flex items-center gap-1.5 text-xs text-brand-blue hover:text-blue-400 font-semibold"
                >
                  <PlusCircle size={14} />
                  Nuevo egreso
                </button>
              </div>

              {showEgreso && (
                <div className="space-y-2 bg-surface-input rounded-xl p-3">
                  <input
                    type="number" inputMode="decimal" value={egresoAmount}
                    onChange={(e) => setEgresoAmount(e.target.value)}
                    placeholder="Monto $0.00"
                    className="w-full bg-transparent border-b border-surface-border pb-1 text-white text-lg font-bold focus:outline-none"
                    autoFocus
                  />
                  <input
                    type="text" value={egresoConcept}
                    onChange={(e) => setEgresoConcept(e.target.value)}
                    placeholder="Concepto (proveedor, insumos...)"
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowEgreso(false)} className="flex-1 h-9 rounded-lg border border-surface-border text-gray-400 text-sm">Cancelar</button>
                    <button onClick={handleEgreso} className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold text-sm">Registrar</button>
                  </div>
                </div>
              )}

              {egresos.length === 0 && !showEgreso && (
                <p className="text-xs text-gray-500">Sin egresos registrados</p>
              )}

              {egresos.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{formatCurrency(e.amount, currency)}</p>
                    <p className="text-gray-400 text-xs">{e.concept} · {formatTime(e.createdAt)}</p>
                  </div>
                  <button onClick={() => setPinAction({ type: 'egreso', id: e.id })} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Arqueo */}
            <ArqueoCard
              efectivoEnCaja={efectivoEnCaja}
              currency={currency}
              onSend={({ bills, coins, billTotal, coinTotal, total, diff }) => {
                if (telegramEnabled) {
                  sendTelegram(
                    telegramToken, telegramChatId,
                    buildArqueoMessage({ bills, coins, billTotal, coinTotal, total, diff, expected: efectivoEnCaja, businessName })
                  )
                }
              }}
            />

            {/* Close session */}
            <div className="bg-surface-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-red-400" />
                <h2 className="font-semibold">Cerrar caja</h2>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Efectivo contado</label>
                <input
                  type="number" inputMode="decimal" value={closeAmount}
                  onChange={(e) => setCloseAmount(e.target.value)}
                  placeholder={formatCurrency(efectivoEnCaja, currency)}
                  className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-lg font-bold focus:outline-none focus:border-brand-blue"
                />
              </div>
              {closeAmount && (
                <div className={`flex justify-between text-sm font-semibold rounded-xl px-4 py-2 ${
                  parseFloat(closeAmount) >= efectivoEnCaja ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  <span>Diferencia</span>
                  <span>{formatCurrency(parseFloat(closeAmount) - efectivoEnCaja, currency)}</span>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nota (opcional)</label>
                <input
                  type="text" value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Observaciones..."
                  className="w-full bg-surface-input border border-surface-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-blue"
                />
              </div>
              <button onClick={() => setPinAction('close')} className="w-full h-11 bg-red-500 hover:bg-red-400 rounded-xl font-bold text-sm text-white transition-colors">
                Cerrar caja
              </button>
            </div>
          </>
        )}
      </div>
    </div>

    {pinAction && (
      <PinModal
        title={
          pinAction === 'open' ? 'Ingresa tu PIN' :
          pinAction === 'close' ? 'Ingresa tu PIN' :
          'PIN para eliminar egreso'
        }
        subtitle={
          pinAction === 'open' ? '¿Quién está abriendo caja?' :
          pinAction === 'close' ? '¿Quién está cerrando caja?' :
          'Solo el administrador puede eliminar egresos'
        }
        employees={pinAction === 'open' || pinAction === 'close' ? employees : undefined}
        correctPin={pinAction?.type === 'egreso' ? adminPin : undefined}
        onCancel={() => setPinAction(null)}
        onSuccess={(employee) => {
          if (pinAction === 'open') execOpen(employee)
          else if (pinAction === 'close') execClose(employee)
          else if (pinAction?.type === 'egreso') deleteEgreso(pinAction.id)
          setPinAction(null)
        }}
      />
    )}
    </>
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
