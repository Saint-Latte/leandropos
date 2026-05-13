const API = 'https://api.telegram.org/bot'

export async function sendTelegram(token, chatId, text) {
  if (!token || !chatId) return
  try {
    await fetch(`${API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch {
    // silent fail — notifications are best-effort
  }
}

export function buildOrderMessage(order, businessName) {
  const time = new Date(order.createdAt).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })
  const methodLabel = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', codi: 'CoDi/QR' }
  const lines = order.items.map((item) => {
    const mods = item.selectedModifiers?.length
      ? '\n  ' + item.selectedModifiers.map((m) => `+ ${m.name}`).join(', ')
      : ''
    return `${item.quantity}x ${item.product.name} — $${item.totalPrice}${mods}`
  })

  let msg = `🧾 <b>Nueva venta — ${businessName}</b>\n`
  msg += `Orden #${order.number} | ${methodLabel[order.paymentMethod] ?? order.paymentMethod}\n`
  msg += `──────────────────\n`
  msg += lines.join('\n') + '\n'
  msg += `──────────────────\n`
  msg += `💰 Total: $${order.total}\n`
  if (order.paymentMethod === 'cash' && order.cashReceived) {
    msg += `💵 Recibido: $${order.cashReceived} | Cambio: $${order.change ?? 0}\n`
  }
  msg += `🕐 ${time}`
  return msg
}

export function buildSessionOpenMessage(session, businessName) {
  const time = new Date(session.openedAt).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })
  return `🟢 <b>Caja abierta — ${businessName}</b>\nFondo inicial: $${session.openingAmount}\n🕐 ${time}`
}

export function buildSessionCloseMessage(session, orders, businessName) {
  const time = new Date(session.closedAt).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })
  const totalSales = orders.reduce((s, o) => s + o.total, 0)
  const cashSales = orders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0)
  const cardSales = orders.filter((o) => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0)
  const diff = session.closingAmount - (session.openingAmount + cashSales)
  const diffStr = diff >= 0 ? `+$${diff} ✅` : `-$${Math.abs(diff)} ⚠️`

  let msg = `🔴 <b>Caja cerrada — ${businessName}</b>\n`
  msg += `──────────────────\n`
  msg += `📦 Ventas: ${orders.length} órdenes\n`
  msg += `💰 Total vendido: $${totalSales}\n`
  if (cashSales > 0) msg += `💵 Efectivo: $${cashSales}\n`
  if (cardSales > 0) msg += `💳 Tarjeta: $${cardSales}\n`
  msg += `──────────────────\n`
  msg += `Cierre de caja: $${session.closingAmount}\n`
  msg += `Diferencia: ${diffStr}\n`
  msg += `🕐 ${time}`
  return msg
}
