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

export function buildOrderMessage(order, businessName, dayTotal = null) {
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
  if (dayTotal !== null) {
    msg += `\n\n📊 <b>Acumulado del día: $${dayTotal}</b>`
  }
  return msg
}

export function buildWhatsAppTicket(order, businessName, businessSubtitle, address) {
  // ── Date & time ─────────────────────────────────────────────────────────────
  const d = new Date(order.createdAt)
  const DAYS   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const dateStr = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
  const timeStr = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  // ── Payment method ───────────────────────────────────────────────────────────
  const PAY_LABEL = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', codi: 'CoDi / QR' }
  const payLabel  = PAY_LABEL[order.paymentMethod] ?? order.paymentMethod

  const SEP = '───────────────────'

  // ── Header ───────────────────────────────────────────────────────────────────
  let txt = `*${businessName}*\n`
  if (businessSubtitle) txt += `_${businessSubtitle}_\n`
  txt += '\n'

  // ── Order meta ───────────────────────────────────────────────────────────────
  txt += `*Ticket #${order.number ?? order.id?.slice(0, 8)}*\n`
  txt += `${dateStr} · ${timeStr}\n`
  txt += `${payLabel}\n`
  if (order.customerName) txt += `${order.customerName}\n`
  txt += `\n${SEP}\n`

  // ── Items ─────────────────────────────────────────────────────────────────────
  for (const item of (order.items ?? [])) {
    txt += `\n*${item.quantity}x ${item.product.name}*  $${item.totalPrice}\n`

    for (const m of (item.selectedModifiers ?? [])) {
      if (m.price > 0) {
        txt += `   + ${m.name}  $${m.price * item.quantity}\n`
      } else {
        txt += `   + ${m.name}\n`
      }
    }

    if (item.note) txt += `   _${item.note}_\n`
  }

  // ── Total ─────────────────────────────────────────────────────────────────────
  txt += `\n${SEP}\n`
  txt += `\n*TOTAL  $${order.total}*\n`

  if (order.paymentMethod === 'cash' && order.cashReceived > order.total) {
    txt += `Recibido  $${order.cashReceived}\n`
    txt += `*Cambio   $${order.change ?? 0}*\n`
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  txt += `\n${SEP}\n`
  if (address) txt += `\n${address}\n`
  txt += `\n_Gracias por elegirnos, te esperamos pronto._`

  return txt
}

export function buildArqueoMessage({ bills, coins, billTotal, coinTotal, total, diff, expected, businessName }) {
  const BILLETES = [1000, 500, 200, 100, 50, 20]
  const MONEDAS  = [20, 10, 5, 2, 1, 0.5]
  const time = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  const fmt = (n) => `$${Number(n).toFixed(2)}`
  const diffStr = diff === 0
    ? `${fmt(0)} ✅`
    : diff > 0
    ? `+${fmt(diff)} ↑ sobrante ⚠️`
    : `-${fmt(Math.abs(diff))} ↓ faltante ⚠️`

  let msg = `🔢 <b>Arqueo de Caja — ${businessName}</b>\n`
  msg += `──────────────────\n`

  const billLines = BILLETES.map((d, i) => ({ d, qty: parseInt(bills[i]) || 0 })).filter(x => x.qty > 0)
  const coinLines = MONEDAS.map((d, i) => ({ d, qty: parseInt(coins[i]) || 0 })).filter(x => x.qty > 0)

  if (billLines.length) {
    msg += `<b>Billetes</b>\n`
    for (const { d, qty } of billLines)
      msg += `  $${d} × ${qty} = ${fmt(d * qty)}\n`
    msg += `  Subtotal billetes: ${fmt(billTotal)}\n`
  }

  if (coinLines.length) {
    if (billLines.length) msg += `\n`
    msg += `<b>Monedas</b>\n`
    for (const { d, qty } of coinLines)
      msg += `  $${d < 1 ? d.toFixed(2) : d} × ${qty} = ${fmt(d * qty)}\n`
    msg += `  Subtotal monedas: ${fmt(coinTotal)}\n`
  }

  msg += `──────────────────\n`
  msg += `💰 Total contado:  ${fmt(total)}\n`
  msg += `📌 Esperado en caja: ${fmt(expected)}\n`
  msg += `📊 Diferencia: ${diffStr}\n`
  msg += `🕐 ${time}`
  return msg
}

export function buildSessionOpenMessage(session, businessName) {
  const time = new Date(session.openedAt).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })
  const who = session.employeeName ? ` · ${session.employeeName}` : ''
  return `🟢 <b>Caja abierta — ${businessName}</b>${who}\nFondo inicial: $${session.openingAmount}\n🕐 ${time}`
}

export function buildSessionCloseMessage(session, orders, egresos = [], businessName) {
  const time = new Date(session.closedAt).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  })
  const totalSales = orders.reduce((s, o) => s + o.total, 0)
  const cashSales = orders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0)
  const cardSales = orders.filter((o) => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0)
  const transferSales = orders.filter((o) => o.paymentMethod === 'transfer').reduce((s, o) => s + o.total, 0)
  const codiSales = orders.filter((o) => o.paymentMethod === 'codi').reduce((s, o) => s + o.total, 0)
  const totalEgresos = egresos.reduce((s, e) => s + e.amount, 0)
  const efectivoEsperado = session.openingAmount + cashSales - totalEgresos
  const diff = session.closingAmount - efectivoEsperado
  const diffStr = diff >= 0 ? `+$${diff} ✅` : `-$${Math.abs(diff)} ⚠️`

  const who = session.employeeName ? ` · ${session.employeeName}` : ''
  let msg = `🔴 <b>Caja cerrada — ${businessName}</b>${who}\n`
  msg += `──────────────────\n`
  msg += `📦 Ventas: ${orders.length} órdenes\n`
  msg += `💰 Total vendido: $${totalSales}\n`
  if (cashSales > 0) msg += `💵 Efectivo: $${cashSales}\n`
  if (cardSales > 0) msg += `💳 Tarjeta: $${cardSales}\n`
  if (transferSales > 0) msg += `📲 Transferencia: $${transferSales}\n`
  if (codiSales > 0) msg += `📱 CoDi/QR: $${codiSales}\n`
  if (totalEgresos > 0) msg += `💸 Egresos: -$${totalEgresos}\n`
  msg += `──────────────────\n`
  msg += `Efectivo esperado: $${efectivoEsperado}\n`
  msg += `Cierre de caja: $${session.closingAmount}\n`
  msg += `Diferencia: ${diffStr}\n`
  msg += `🕐 ${time}`
  return msg
}
