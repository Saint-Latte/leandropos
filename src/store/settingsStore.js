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
      telegramEnabled: true,
      telegramToken: '8600245960:AAEbvA41slCb912_hjD-25z7bE3mA1qMylw',
      telegramChatId: '1988534095',

      update: (data) => set((s) => ({ ...s, ...data })),
    }),
    { name: 'lpos-settings' }
  )
)

export default useSettingsStore
