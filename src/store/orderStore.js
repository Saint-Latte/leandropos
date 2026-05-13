import { create } from 'zustand'
import { generateId, todayKey } from '../lib/utils'

// Keeps current order in memory only (no persist needed — resets on new order)
const EMPTY = {
  customerName: '',
  items: [],      // { id, product, quantity, selectedModifiers[], note, unitPrice, totalPrice }
}

const useOrderStore = create((set, get) => ({
  current: { ...EMPTY },
  selectedProduct: null,  // product open in modifier panel

  // ── Build order ──────────────────────────────────────────────────────────────
  setCustomerName: (customerName) =>
    set((s) => ({ current: { ...s.current, customerName } })),

  openProduct: (product) => set({ selectedProduct: product }),
  closeProduct: () => set({ selectedProduct: null }),

  addItem: ({ product, quantity = 1, selectedModifiers = [], note = '' }) => {
    const modTotal = selectedModifiers.reduce((s, m) => s + (m.price ?? 0), 0)
    const unitPrice = product.price + modTotal
    const item = {
      id: generateId(),
      product,
      quantity,
      selectedModifiers,
      note,
      unitPrice,
      totalPrice: unitPrice * quantity,
    }
    set((s) => ({
      current: { ...s.current, items: [...s.current.items, item] },
      selectedProduct: null,
    }))
  },

  removeItem: (itemId) =>
    set((s) => ({
      current: { ...s.current, items: s.current.items.filter((i) => i.id !== itemId) },
    })),

  updateQuantity: (itemId, delta) =>
    set((s) => ({
      current: {
        ...s.current,
        items: s.current.items
          .map((i) =>
            i.id === itemId
              ? { ...i, quantity: Math.max(1, i.quantity + delta), totalPrice: i.unitPrice * Math.max(1, i.quantity + delta) }
              : i
          ),
      },
    })),

  getTotals: () => {
    const items = get().current.items
    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0)
    return { subtotal, total: subtotal }
  },

  resetOrder: () => set({ current: { ...EMPTY }, selectedProduct: null }),

  // ── Complete order (returns saved order object) ──────────────────────────────
  completeOrder: ({ paymentMethod, cashReceived, orderNumber }) => {
    const { current } = get()
    const { total } = get().getTotals()
    const order = {
      id: generateId(),
      number: orderNumber,
      date: todayKey(),
      createdAt: new Date().toISOString(),
      customerName: current.customerName,
      items: current.items,
      subtotal: total,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? (cashReceived ?? total) : null,
      change: paymentMethod === 'cash' ? Math.max(0, (cashReceived ?? total) - total) : null,
    }
    set({ current: { ...EMPTY }, selectedProduct: null })
    return order
  },
}))

export default useOrderStore
