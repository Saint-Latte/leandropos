import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      businessName: 'Leandro Valle',
      currency: 'MXN',
      taxRate: 0,
      address: '',
      phone: '',

      update: (data) => set((s) => ({ ...s, ...data })),
    }),
    { name: 'lpos-settings' }
  )
)

export default useSettingsStore
