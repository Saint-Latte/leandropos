import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '../lib/utils'
import { SEED_CATEGORIES, SEED_PRODUCTS } from '../lib/seedData'

const useMenuStore = create(
  persist(
    (set, get) => ({
      categories: SEED_CATEGORIES,
      products: SEED_PRODUCTS,

      // ── Categories ──────────────────────────────────────────────────────────
      addCategory: (data) =>
        set((s) => ({
          categories: [...s.categories, { id: generateId(), emoji: '📦', ...data }],
        })),

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          products: s.products.map((p) =>
            p.categoryId === id ? { ...p, categoryId: null } : p
          ),
        })),

      // ── Products ────────────────────────────────────────────────────────────
      addProduct: (data) =>
        set((s) => ({
          products: [
            ...s.products,
            { id: generateId(), image: null, modifierGroups: [], ...data },
          ],
        })),

      updateProduct: (id, data) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      // ── Modifier groups on a product ─────────────────────────────────────────
      addModifierGroup: (productId, group) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  modifierGroups: [
                    ...p.modifierGroups,
                    { id: generateId(), required: false, multiple: false, options: [], ...group },
                  ],
                }
              : p
          ),
        })),

      updateModifierGroup: (productId, groupId, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  modifierGroups: p.modifierGroups.map((g) =>
                    g.id === groupId ? { ...g, ...data } : g
                  ),
                }
              : p
          ),
        })),

      deleteModifierGroup: (productId, groupId) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? { ...p, modifierGroups: p.modifierGroups.filter((g) => g.id !== groupId) }
              : p
          ),
        })),

      addModifierOption: (productId, groupId, option) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  modifierGroups: p.modifierGroups.map((g) =>
                    g.id === groupId
                      ? { ...g, options: [...g.options, { id: generateId(), price: 0, ...option }] }
                      : g
                  ),
                }
              : p
          ),
        })),

      updateModifierOption: (productId, groupId, optionId, data) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  modifierGroups: p.modifierGroups.map((g) =>
                    g.id === groupId
                      ? {
                          ...g,
                          options: g.options.map((o) =>
                            o.id === optionId ? { ...o, ...data } : o
                          ),
                        }
                      : g
                  ),
                }
              : p
          ),
        })),

      deleteModifierOption: (productId, groupId, optionId) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  modifierGroups: p.modifierGroups.map((g) =>
                    g.id === groupId
                      ? { ...g, options: g.options.filter((o) => o.id !== optionId) }
                      : g
                  ),
                }
              : p
          ),
        })),

      getProductsByCategory: (categoryId) =>
        get().products.filter((p) => p.categoryId === categoryId),
    }),
    { name: 'lpos-menu' }
  )
)

export default useMenuStore
