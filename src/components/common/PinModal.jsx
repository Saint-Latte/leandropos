import { useState } from 'react'
import { X, Delete } from 'lucide-react'

// correctPin  → single admin PIN (string/number)
// employees   → [{ name, pin }] array for shift PINs — onSuccess(employee)
export default function PinModal({ title, subtitle, correctPin, employees, onSuccess, onCancel }) {
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  const handleKey = (digit) => {
    if (shake) return
    const next = input + digit
    setInput(next)
    if (next.length === 4) {
      if (employees) {
        const match = employees.find((e) => e.pin === next)
        if (match) {
          onSuccess(match)
        } else {
          setShake(true)
          setTimeout(() => { setInput(''); setShake(false) }, 600)
        }
      } else {
        if (next === String(correctPin)) {
          onSuccess()
        } else {
          setShake(true)
          setTimeout(() => { setInput(''); setShake(false) }, 600)
        }
      }
    }
  }

  const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del']

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-secondary w-full max-w-xs rounded-2xl border border-surface-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-base">{title}</h2>
          {onCancel && (
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-500 mb-5">{subtitle}</p>}

        {/* Dots */}
        <div className={`flex justify-center gap-4 mb-6 ${shake ? 'animate-pulse' : ''}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                shake ? 'bg-red-500' :
                i < input.length ? 'bg-brand-blue scale-110' : 'bg-surface-border'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((key, i) => {
            if (key === null) return <div key={i} />
            if (key === 'del') return (
              <button
                key={i}
                onClick={() => setInput((v) => v.slice(0, -1))}
                className="h-14 rounded-xl bg-surface-card text-gray-400 hover:bg-surface-hover flex items-center justify-center transition-colors"
              >
                <Delete size={18} />
              </button>
            )
            return (
              <button
                key={i}
                onClick={() => handleKey(String(key))}
                className="h-14 rounded-xl bg-surface-card text-white font-bold text-xl hover:bg-surface-hover active:scale-95 transition-all"
              >
                {key}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
