import { create } from 'zustand'
import api from '../api/polotab'
import useSettingsStore from './settingsStore'
import useMenuStore from './menuStore'

const usePolotabStore = create((set, get) => ({
  connected: false,
  connecting: false,
  error: null,
  modsByName: {},   // modifier item name (lowercase) → polotab modifier item id

  connect: async (apiKey, restaurantId) => {
    set({ connecting: true, error: null })
    try {
      const data = await api.getRestaurantToken(apiKey, restaurantId)
      const token = data?.token ?? data?.accessToken ?? data
      if (!token || typeof token !== 'string') throw new Error('Token inválido recibido')
      api.setToken(token)
      useSettingsStore.getState().update({
        polotabApiKey: apiKey,
        polotabRestaurantId: restaurantId,
        polotabToken: token,
      })
      await get()._loadAndMap()
      set({ connected: true, connecting: false, error: null })
    } catch (err) {
      api.clearToken()
      set({ connected: false, connecting: false, error: err.message })
    }
  },

  reconnect: async () => {
    const { polotabToken } = useSettingsStore.getState()
    if (!polotabToken) return
    api.setToken(polotabToken)
    try {
      await get()._loadAndMap()
      set({ connected: true, error: null })
    } catch {
      // silent — might just be offline
      set({ connected: true, error: null }) // optimistic: token exists, assume ok
    }
  },

  disconnect: () => {
    api.clearToken()
    useSettingsStore.getState().update({ polotabToken: '' })
    set({ connected: false, error: null, modsByName: {} })
  },

  _loadAndMap: async () => {
    try {
      // Get POS channel
      const channels = await api.getChannels()
      const channelList = Array.isArray(channels) ? channels : (channels?.data ?? [])
      const posChannel = channelList.find((c) =>
        c.name?.toLowerCase().includes('pos') || c.type === 'pos'
      ) ?? channelList[0]
      const channelId = posChannel?.id

      // Load modifier groups
      const modGroups = await api.getModifierGroups(channelId)
      const modGroupList = Array.isArray(modGroups) ? modGroups : (modGroups?.data ?? [])
      const modsByName = {}
      modGroupList.forEach((group) => {
        ;(group.modifierItems ?? group.items ?? []).forEach((mi) => {
          if (mi.name && mi.id) {
            modsByName[mi.name.toLowerCase()] = mi.id
          }
        })
      })
      set({ modsByName })

      // Load menus and map local products to polotab item IDs
      if (channelId) {
        const menus = await api.getMenusByChannel(channelId)
        const menuList = Array.isArray(menus) ? menus : (menus?.data ?? [])
        const { products, updateProduct } = useMenuStore.getState()

        menuList.forEach((menu) => {
          ;(menu.items ?? []).forEach((polotabItem) => {
            const match = products.find(
              (p) => p.name.toLowerCase() === polotabItem.name?.toLowerCase()
            )
            if (match) {
              const price = polotabItem.prices?.[0]
              updateProduct(match.id, {
                _polotabItemId: polotabItem.id,
                _polotabMenuId: menu.id,
                _polotabPriceId: price?.id ?? null,
              })
            }
          })
        })
      }
    } catch (err) {
      console.warn('[Polotab] _loadAndMap failed:', err.message)
    }
  },

  submitOrderToPolotab: async (order) => {
    if (!get().connected) return
    try {
      const { modsByName } = get()
      const orderItems = (order.items ?? [])
        .map((item) => {
          const itemId = item.product?._polotabItemId
          if (!itemId) return null
          const modifiers = (item.selectedModifiers ?? [])
            .map((m) => {
              const modId = modsByName[m.name?.toLowerCase()]
              if (!modId) return null
              return { itemId: modId }
            })
            .filter(Boolean)
          return {
            itemId,
            quantity: item.quantity ?? 1,
            ...(modifiers.length ? { orderItemModifiers: modifiers } : {}),
          }
        })
        .filter(Boolean)

      if (!orderItems.length) return

      const body = {
        customerName: order.customerName ?? 'Comanda',
        orderItems,
      }

      const created = await api.upsertOrder(body)
      if (created?.id) {
        await api.publishOrder(created.id)
      }
    } catch (err) {
      console.warn('[Polotab] submitOrderToPolotab failed:', err.message)
    }
  },
}))

export default usePolotabStore
