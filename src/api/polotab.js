const BASE_URL = 'https://api.polotab.com'

class PolotabAPI {
  constructor() {
    this._token = null
  }

  setToken(token) {
    this._token = token
  }

  clearToken() {
    this._token = null
  }

  async _request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this._token ? { Authorization: `Bearer ${this._token}` } : {}),
      ...options.headers,
    }
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    if (!res.ok) {
      let msg = `HTTP ${res.status}`
      try { const body = await res.json(); msg = body.message ?? msg } catch {}
      const err = new Error(msg)
      err.status = res.status
      throw err
    }
    const text = await res.text()
    if (!text) return null
    try { return JSON.parse(text) } catch { return text }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  async getRestaurantToken(apiKey, restaurantId) {
    return this._request('/auth/v1/restaurants/token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ restaurantId }),
    })
  }

  // ── Restaurant ────────────────────────────────────────────────────────────
  async getRestaurant() {
    return this._request('/restaurants/v1/restaurant')
  }

  // ── Menu ──────────────────────────────────────────────────────────────────
  async getChannels() {
    return this._request('/menus/v1/channels')
  }

  async getMenusByChannel(channelId) {
    return this._request(`/menus/v1/channels/${channelId}/menus?expand=items`)
  }

  async getModifierGroups(channelId) {
    const q = new URLSearchParams({ expand: 'modifierItems' })
    if (channelId) q.set('channel_id', channelId)
    return this._request(`/menus/v1/modifier_groups?${q}`)
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  async getOrders(params = {}) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => v != null && q.set(k, v))
    return this._request(`/orders/v1/orders?${q}`)
  }

  async getOrder(orderId) {
    return this._request(`/orders/v1/orders/${orderId}`)
  }

  async voidOrder(orderId) {
    return this._request(`/orders/v1/orders/${orderId}/void`, { method: 'POST', body: '{}' })
  }

  async getTables() {
    return this._request('/restaurants/v1/tables')
  }

  async upsertOrder(body) {
    return this._request('/orders/v1/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async publishOrder(orderId) {
    return this._request(`/orders/v1/orders/${orderId}/publish`, {
      method: 'POST',
      body: '{}',
    })
  }
}

export default new PolotabAPI()
