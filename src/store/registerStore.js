import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId, todayKey } from '../lib/utils'

const useRegisterStore = create(
  persist(
    (set, get) => ({
      session: null,
      // dailyRecords: { [YYYY-MM-DD]: { sessions[], orders[], egresos[] } }
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
        const existing = dailyRecords[key] ?? { sessions: [], orders: [], egresos: [] }
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

      recordOrder: (order) => {
        const key = order.date ?? todayKey()
        set((s) => {
          const existing = s.dailyRecords[key] ?? { sessions: [], orders: [], egresos: [] }
          return {
            dailyRecords: {
              ...s.dailyRecords,
              [key]: { ...existing, orders: [...existing.orders, order] },
            },
          }
        })
      },

      recordEgreso: ({ amount, concept }) => {
        const key = todayKey()
        const egreso = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          amount: parseFloat(amount) || 0,
          concept: concept || 'Sin concepto',
        }
        set((s) => {
          const existing = s.dailyRecords[key] ?? { sessions: [], orders: [], egresos: [] }
          return {
            dailyRecords: {
              ...s.dailyRecords,
              [key]: { ...existing, egresos: [...(existing.egresos ?? []), egreso] },
            },
          }
        })
        return egreso
      },

      deleteEgreso: (egresoId) => {
        const key = todayKey()
        set((s) => {
          const existing = s.dailyRecords[key]
          if (!existing) return s
          return {
            dailyRecords: {
              ...s.dailyRecords,
              [key]: { ...existing, egresos: (existing.egresos ?? []).filter((e) => e.id !== egresoId) },
            },
          }
        })
      },

      getDayRecord: (dateKey) => get().dailyRecords[dateKey] ?? { sessions: [], orders: [], egresos: [] },

      getDayKeys: () => Object.keys(get().dailyRecords).sort().reverse(),
    }),
    { name: 'lpos-register' }
  )
)

export default useRegisterStore
