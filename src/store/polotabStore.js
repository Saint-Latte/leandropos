import { create } from 'zustand'
import api from '../api/polotab'
import useSettingsStore from './settingsStore'
import useMenuStore from './menuStore'

const usePolotabStore = create((set, get) => ({
  connected: false,
  connecting: false,
  error: null,
  modsByName: {},  // name.lower → { polotabItemId, polotabPriceId }

  // ── Connect from scratch (Settings page) ─────────────────────────────────
  connect: async (apiKey, restaurantId) => {
    set({ connecting: true, error: null })
    try {
      const data = await api.getRestaurantToken(apiKey, restaurantId)
      const token = data?.token ?? data?.restaurantToken ?? data
      if (!token || typeof token !== 'string') throw new Error('Token inválido')

      api.setToken(token)
      useSettingsStore.getState().update({ polotabToken: token, polotabApiKey: apiKey, polotabRestaurantId: restaurantId })

      await get()._loadAndMap()
      set({ connected: true, connecting: false, error: null })
    } catch (err) {
      set({ connecting: false, connected: false, error: err.message })
    }
  },

  // ── Reconnect on app load using stored token ──────────────────────────────
  reconnect: async () => {
    const { polotabToken } = useSettingsStore.getState()
    if (!polotabToken) return
    api.setToken(polotabToken)
    try {
      await get()._loadAndMap()
      set({ connected: true, error: null })
    } catch (err) {
      // Token expired or network issue — don't block the app
      set({ connected: false, error: err.message })
    }
  },

  disconnect: () => {
    api.clearToken()
    useSettingsStore.getState().update({ polotabToken: '' })
    set({ connected: false, error: null, modsByName: {} })
  },

  // ── Internal: load Polotab menu and map IDs to local products ─────────────
  _loadAndMap: async () => {
    const channels = await api.getChannels()
    const posChannel = (channels ?? []).find((c) => c.type === 'pos') ?? channels?.[0]
    if (!posChannel) throw new Error('No se encontró canal POS en Polotab')

    const [menusData, modGroups] = await Promise.all([
      api.getMenusByChannel(posChannel.id),
      api.getModifierGroups(posChannel.id),
    ])

    // Build modifier item name map
    const modsByName = {}
    for (const mg of modGroups ?? []) {
      for (const mi of mg.modifierItems ?? []) {
        const key = mi.name?.toLowerCase().trim()
        if (key) modsByName[key] = {
          polotabItemId: mi.id,
          polotabPriceId: mi.prices?.[0]?.id ?? null,
        }
      }
    }

    // Build product item name map
    const itemsByName = {}
    for (const menu of menusData ?? []) {
      for (const item of menu.items ?? []) {
        const key = item.name?.toLowerCase().trim()
        if (key) itemsByName[key] = {
          polotabItemId: item.id,
          polotabMenuId: menu.id,
          polotabPriceId: item.prices?.[0]?.id ?? null,
        }
      }
    }

    // Stamp Polotab IDs onto local products (persisted in menuStore)
    const { products, updateProduct } = useMenuStore.getState()
    for (const product of products) {
      const match = itemsByName[product.name?.toLowerCase().trim()]
      if (match) {
        updateProduct(product.id, {
          _polotabItemId: match.polotabItemId,
          _polotabMenuId: match.polotabMenuId,
          _polotabPriceId: match.polotabPriceId,
        })
      }
    }

    set({ modsByName })
    return { itemsByName, modsByName }
  },

  // ── Submit a completed LeandrosPOS order to Polotab for tablet printing ───
  submitOrderToPolotab: async (order) => {
    if (!get().connected) return
    const { modsByName } = get()

    try {
      const orderItems = (order.items ?? [])
        .map((item) => {
          const pid = item.product._polotabItemId
          const mid = item.product._polotabMenuId
          const prid = item.product._polotabPriceId
          if (!pid) return null

          const orderItemModifiers = (item.selectedModifiers ?? [])
            .map((mod) => {
              const m = modsByName[mod.name?.toLowerCase().trim()]
              if (!m) return null
              return {
                id: crypto.randomUUID(),
                itemId: m.polotabItemId,
                priceId: m.polotabPriceId,
                quantity: 1,
                sizeId: null,
              }
            })
            .filter(Boolean)

          return {
            id: crypto.randomUUID(),
            itemId: pid,
            menuId: mid,
            quantity: item.quantity,
            priceId: prid,
            sizeId: null,
            sizePriceId: null,
            sizePrice: null,
            note: item.note || null,
            terminalDate: new Date().toISOString(),
            orderItemModifiers,
          }
        })
        .filter(Boolean)

      if (!orderItems.length) return

      const body = {
        type: 'direct_sale',
        customerName: order.customerName || undefined,
        orderItems,
      }

      const created = await api.upsertOrder(body)
      await api.publishOrder(created.id)
    } catch (err) {
      console.warn('[Polotab] Impresión falló:', err.message)
      if (err.status === 401) {
        set({ connected: false, error: 'Sesión expirada — reconecta en Configuración' })
      }
    }
  },
}))

export default usePolotabStore
