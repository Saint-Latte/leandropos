import { useState } from 'react'
import { Calculator, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

const BILLETES = [1000, 500, 200, 100, 50, 20]
const MONEDAS  = [20, 10, 5, 2, 1, 0.5]

export { BILLETES, MONEDAS }

export default function ArqueoCard({ efectivoEnCaja, currency, onSend }) {
  const [show, setShow]   = useState(false)
  const [bills, setBills] = useState(Array(BILLETES.length).fill(''))
  const [coins, setCoins] = useState(Array(MONEDAS.length).fill(''))

  const billTotal = BILLETES.reduce((s, d, i) => s + (parseInt(bills[i]) || 0) * d, 0)
  const coinTotal = MONEDAS.reduce((s, d, i) => s + (parseFloat(coins[i]) || 0) * d, 0)
  const total     = billTotal + coinTotal
  const diff      = total - efectivoEnCaja
  const hasAny    = bills.some(Boolean) || coins.some(Boolean)

  const setB = (i, v) => { const n = [...bills]; n[i] = v; setBills(n) }
  const setC = (i, v) => { const n = [...coins]; n[i] = v; setCoins(n) }

  return (
    <div className="bg-surface-card rounded-2xl p-5 space-y-4">
      {/* Header */}
      <button
        onClick={() => setShow(!show)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-brand-orange" />
          <h2 className="font-semibold text-left">Arqueo de Caja</h2>
        </div>
        {show
          ? <ChevronUp size={16} className="text-gray-500" />
          : <ChevronDown size={16} className="text-gray-500" />
        }
      </button>

      {show && (
        <>
          {/* Denomination grid */}
          <div className="grid grid-cols-2 gap-x-4">
            {/* Billetes */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase">Billetes</p>
              {BILLETES.map((d, i) => (
                <DenomRow key={`b${d}`} denom={d} value={bills[i]} currency={currency} onChange={(v) => setB(i, v)} />
              ))}
              {billTotal > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-surface-border">
                  <span className="text-xs text-gray-500">Subtotal</span>
                  <span className="text-xs font-bold text-white">{formatCurrency(billTotal, currency)}</span>
                </div>
              )}
            </div>

            {/* Monedas */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase">Monedas</p>
              {MONEDAS.map((d, i) => (
                <DenomRow key={`c${d}`} denom={d} value={coins[i]} currency={currency} onChange={(v) => setC(i, v)} />
              ))}
              {coinTotal > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-surface-border">
                  <span className="text-xs text-gray-500">Subtotal</span>
                  <span className="text-xs font-bold text-white">{formatCurrency(coinTotal, currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-surface-input rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total contado</span>
              <span className="text-white font-bold text-base">{formatCurrency(total, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Esperado en caja</span>
              <span className="text-gray-300">{formatCurrency(efectivoEnCaja, currency)}</span>
            </div>
            {hasAny && (
              <div className={`flex justify-between text-sm font-bold pt-1 border-t border-surface-border ${
                diff === 0 ? 'text-green-400' : diff > 0 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <span>Diferencia</span>
                <span>
                  {diff > 0 ? '+' : ''}{formatCurrency(diff, currency)}
                  {diff === 0 ? ' ✓' : diff > 0 ? ' ↑ sobrante' : ' ↓ faltante'}
                </span>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={() => onSend({ bills, coins, billTotal, coinTotal, total, diff })}
            disabled={!hasAny}
            className="w-full h-10 flex items-center justify-center gap-2 bg-brand-orange/20 hover:bg-brand-orange/30 disabled:opacity-40 disabled:cursor-not-allowed text-brand-orange rounded-xl font-semibold text-sm transition-colors"
          >
            <Send size={14} />
            Enviar arqueo a Telegram
          </button>
        </>
      )}
    </div>
  )
}

function DenomRow({ denom, value, onChange, currency }) {
  const qty = parseInt(value) || 0
  const sub = qty * denom
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span className="text-gray-400 text-xs w-10 shrink-0 font-mono">
        ${denom < 1 ? denom.toFixed(2) : denom}
      </span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-10 bg-surface-input border border-surface-border rounded-lg text-center text-white text-xs font-bold focus:outline-none focus:border-brand-orange py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-gray-500 text-xs ml-auto truncate">
        {sub > 0 ? formatCurrency(sub, currency) : ''}
      </span>
    </div>
  )
}
