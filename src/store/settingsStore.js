import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
  persist(
    (set) => ({
      businessName: 'Saint Latte',
      businessSubtitle: 'Specialty Coffee Shop',
      currency: 'MXN',
      taxRate: 0,
      address: '',
      phone: '',
      telegramEnabled: true,
      telegramToken: '8600245960:AAEbvA41slCb912_hjD-25z7bE3mA1qMylw',
      telegramChatId: '1988534095',
      adminPin: '0000',
      inactivityMinutes: 30,
      hourlyReport: true,

      update: (data) => set((s) => ({ ...s, ...data })),
    }),
    {
      name: 'lpos-settings',
      version: 3,
      migrate: (stored) => ({
        ...stored,
        businessName: 'Saint Latte',
        businessSubtitle: stored.businessSubtitle ?? 'Specialty Coffee Shop',
        adminPin: stored.adminPin ?? '0000',
        inactivityMinutes: stored.inactivityMinutes ?? 30,
        hourlyReport: stored.hourlyReport ?? true,
      }),
    }
  )
)

export default useSettingsStore
