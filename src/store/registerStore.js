import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId, todayKey } from '../lib/utils'

const useRegisterStore = create(
  persist(
    (set, get) => ({
      // Active cash session
      session: null,      // { id, date, openingAmount, note }
      // All closed sessions stored as daily records
      // dailyRecords: { [YYYY-MM-DD]: { sessions[], orders[] } }
      dailyRecords: {},

      isOpen: () => !!get().session,

      openSession: ({ openingAmount = 0, note = '' } = {}) => {
        const session = {
          id: generateId(),
          date: todayKey(),
          openedAt: new Date().toISOString(),
          openingAmount,
          note,
        }
        set({ session })
      },

      closeSession: ({ closingAmount, note = '' } = {}) => {
        const { session, dailyRecords } = get()
        if (!session) return

        const key = session.date
        const existing = dailyRecords[key] ?? { sessions: [], orders: [] }
        const closed = {
          ...session,
          closedAt: new Date().toISOString(),
          closingAmount: closingAmount ?? 0,
          closeNote: note,
        }

        set({
          session: null,
          dailyRecords: {
            ...dailyRecords,
            [key]: { ...existing, sessions: [...existing.sessions, closed] },
          },
        })
      },

      // Called by orderStore after a completed order
      recordOrder: (order) => {
        const key = order.date ?? todayKey()
        set((s) => {
          const existing = s.dailyRecords[key] ?? { sessions: [], orders: [] }
          return {
            dailyRecords: {
              ...s.dailyRecords,
              [key]: { ...existing, orders: [...existing.orders, order] },
            },
          }
        })
      },

      getDayRecord: (dateKey) => get().dailyRecords[dateKey] ?? { sessions: [], orders: [] },

      getDayKeys: () => Object.keys(get().dailyRecords).sort().reverse(),
    }),
    { name: 'lpos-register' }
  )
)

export default useRegisterStore
