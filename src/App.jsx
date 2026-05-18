import { useEffect, useRef } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import POS from './pages/POS'
import Register from './pages/Register'
import Reports from './pages/Reports'
import Menu from './pages/Menu'
import Settings from './pages/Settings'
import Orders from './pages/Orders'
import Waiter from './pages/Waiter'
import useRegisterStore from './store/registerStore'
import useSettingsStore from './store/settingsStore'
import usePolotabStore from './store/polotabStore'
import { sendTelegram } from './lib/telegram'

function AlertEngine() {
  const lastInactivityAlert = useRef(0)
  const lastHourlyHour = useRef(-1)

  useEffect(() => {
    const tick = () => {
      const { session, dailyRecords } = useRegisterStore.getState()
      const { telegramEnabled, telegramToken, telegramChatId, businessName,
              inactivityMinutes, hourlyReport } = useSettingsStore.getState()

      if (!telegramEnabled || !session) return

      const now = new Date()
      const todayKey = now.toISOString().slice(0, 10)
      const allOrders = dailyRecords[todayKey]?.orders ?? []
      const sessionOrders = allOrders.filter((o) => o.createdAt >= session.openedAt)
      const egresos = dailyRecords[todayKey]?.egresos ?? []

      // ── Hourly summary ────────────────────────────────────────────────────
      const currentHour = now.getHours()
      if (hourlyReport && now.getMinutes() === 0 && currentHour !== lastHourlyHour.current) {
        lastHourlyHour.current = currentHour
        const totalSales = sessionOrders.reduce((s, o) => s + o.total, 0)
        const cashSales = sessionOrders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0)
        const cardSales = sessionOrders.filter((o) => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0)
        const transferSales = sessionOrders.filter((o) => o.paymentMethod === 'transfer').reduce((s, o) => s + o.total, 0)
        const codiSales = sessionOrders.filter((o) => o.paymentMethod === 'codi').reduce((s, o) => s + o.total, 0)
        const totalEgresos = egresos.reduce((s, e) => s + e.amount, 0)
        const lastOrder = sessionOrders.length
          ? new Date(sessionOrders[sessionOrders.length - 1].createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : '—'

        let msg = `📊 <b>Resumen ${now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} — ${businessName}</b>\n`
        msg += `──────────────────\n`
        msg += `📦 Órdenes: ${sessionOrders.length}\n`
        msg += `💰 Total: $${totalSales}\n`
        if (cashSales > 0) msg += `💵 Efectivo: $${cashSales}\n`
        if (cardSales > 0) msg += `💳 Tarjeta: $${cardSales}\n`
        if (transferSales > 0) msg += `📲 Transferencia: $${transferSales}\n`
        if (codiSales > 0) msg += `📱 CoDi/QR: $${codiSales}\n`
        if (totalEgresos > 0) msg += `💸 Egresos: -$${totalEgresos}\n`
        msg += `🕐 Última venta: ${lastOrder}`
        sendTelegram(telegramToken, telegramChatId, msg)
      }

      // ── Inactivity alert ──────────────────────────────────────────────────
      if (!inactivityMinutes) return
      const nowMs = now.getTime()
      if (nowMs - lastInactivityAlert.current < inactivityMinutes * 60 * 1000) return

      let referenceTime = new Date(session.openedAt).getTime()
      if (sessionOrders.length) {
        referenceTime = new Date(sessionOrders[sessionOrders.length - 1].createdAt).getTime()
      }

      const elapsed = (nowMs - referenceTime) / 60000
      if (elapsed >= inactivityMinutes) {
        lastInactivityAlert.current = nowMs
        const lastTime = new Date(referenceTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        const label = sessionOrders.length ? `última venta a las ${lastTime}` : `caja abierta sin ventas desde ${lastTime}`
        sendTelegram(telegramToken, telegramChatId,
          `⚠️ <b>Sin actividad — ${businessName}</b>\n${Math.floor(elapsed)} min sin ventas (${label})`
        )
      }
    }

    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return null
}

function PolotabInit() {
  useEffect(() => {
    const { polotabToken } = useSettingsStore.getState()
    if (polotabToken) usePolotabStore.getState().reconnect()
  }, [])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-full">
        <AlertEngine />
        <PolotabInit />
        <Routes>
          <Route path="/"         element={<POS />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reports"  element={<Reports />} />
          <Route path="/menu"     element={<Menu />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/waiter"   element={<Waiter />}   />
          <Route path="/orders"   element={<Orders />}   />
        </Routes>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
