import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, X, Check } from 'lucide-react'
import { formatCurrency, getCategoryColor } from '../lib/utils'
import useMenuStore from '../store/menuStore'
import useSettingsStore from '../store/settingsStore'

export default function Menu() {
  const { categories, products, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct } = useMenuStore()
  const { currency } = useSettingsStore()
  const [expandedCat, setExpandedCat] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)  // product or 'new'
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCatMode, setNewCatMode] = useState(false)
  const [targetCategoryId, setTargetCategoryId] = useState(null)

  const openNewProduct = (categoryId) => {
    setTargetCategoryId(categoryId)
    setEditingProduct({ categoryId, name: '', price: '', emoji: '', modifierGroups: [] })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-surface">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-secondary shrink-0">
        <h1 className="font-bold text-base">Menú</h1>
        <button
          onClick={() => setNewCatMode(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-brand-blue hover:bg-blue-500 rounded-lg text-white"
        >
          <Plus size={14} /> Categoría
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-surface-border">
        {/* New category form */}
        {newCatMode && (
          <CategoryForm
            initial={{ name: '', emoji: '📦' }}
            onSave={(data) => { addCategory(data); setNewCatMode(false) }}
            onCancel={() => setNewCatMode(false)}
          />
        )}

        {categories.map((cat, idx) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id)
          const isExpanded = expandedCat === cat.id
          const color = getCategoryColor(idx)

          if (editingCategory === cat.id) {
            return (
              <CategoryForm
                key={cat.id}
                initial={cat}
                onSave={(data) => { updateCategory(cat.id, data); setEditingCategory(null) }}
                onCancel={() => setEditingCategory(null)}
              />
            )
          }

          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 px-4 py-3 hover:bg-surface-hover transition-colors">
                <button onClick={() => setExpandedCat(isExpanded ? null : cat.id)} className="flex-1 flex items-center gap-2 text-left">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="font-semibold text-sm text-white">{cat.name}</span>
                  <span className="text-xs text-gray-500">({catProducts.length})</span>
                  <div className="w-2 h-2 rounded-full ml-1 shrink-0" style={{ backgroundColor: color }} />
                  {isExpanded ? <ChevronDown size={15} className="text-gray-500 ml-auto" /> : <ChevronRight size={15} className="text-gray-500 ml-auto" />}
                </button>
                <button onClick={() => setEditingCategory(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-500 hover:text-white">
                  <Pencil size={13} />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>

              {isExpanded && (
                <div className="bg-surface-card/20 pb-2">
                  {catProducts.map((product) => (
                    editingProduct?.id === product.id ? (
                      <ProductForm
                        key={product.id}
                        initial={product}
                        currency={currency}
                        onSave={(data) => { updateProduct(product.id, data); setEditingProduct(null) }}
                        onCancel={() => setEditingProduct(null)}
                      />
                    ) : (
                      <div key={product.id} className="flex items-center gap-2 px-6 py-2 hover:bg-surface-hover transition-colors">
                        <span className="text-base">{product.emoji ?? '🍽️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{product.name}</p>
                          {product.modifierGroups?.length > 0 && (
                            <p className="text-xs text-gray-500">{product.modifierGroups.length} grupos de modificadores</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-white shrink-0">{formatCurrency(product.price, currency)}</span>
                        <button onClick={() => setEditingProduct(product)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-500 hover:text-white shrink-0">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  ))}

                  {editingProduct?.categoryId === cat.id && !editingProduct?.id && (
                    <ProductForm
                      initial={editingProduct}
                      currency={currency}
                      onSave={(data) => { addProduct({ ...data, categoryId: cat.id }); setEditingProduct(null) }}
                      onCancel={() => setEditingProduct(null)}
                    />
                  )}

                  <button
                    onClick={() => openNewProduct(cat.id)}
                    className="flex items-center gap-2 px-6 py-2 text-xs text-brand-blue hover:text-blue-400 transition-colors"
                  >
                    <Plus size={13} /> Agregar producto
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && !newCatMode && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
            <p className="text-sm">Sin categorías — crea una para empezar</p>
          </div>
        )}
      </div>

      {/* Product editor modal */}
      {editingProduct && editingProduct.id && (
        <ProductEditorModal
          product={editingProduct}
          currency={currency}
          onSave={(data) => { updateProduct(editingProduct.id, data); setEditingProduct(null) }}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}

// ── Inline forms ─────────────────────────────────────────────────────────────

function CategoryForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial.name)
  const [emoji, setEmoji] = useState(initial.emoji ?? '📦')
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface-input border-b border-surface-border">
      <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-10 bg-transparent text-center text-lg focus:outline-none" maxLength={2} />
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre categoría" className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && name && onSave({ name, emoji })} />
      <button onClick={() => name && onSave({ name, emoji })} disabled={!name} className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-blue disabled:opacity-40 text-white"><Check size={14} /></button>
      <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><X size={14} /></button>
    </div>
  )
}

function ProductForm({ initial, currency, onSave, onCancel }) {
  const [name, setName] = useState(initial.name)
  const [price, setPrice] = useState(initial.price || '')
  const [emoji, setEmoji] = useState(initial.emoji ?? '')
  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-surface-input border-b border-surface-border">
      <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-8 bg-transparent text-center text-base focus:outline-none" maxLength={2} placeholder="🍽" />
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre producto" className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none" />
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" className="w-20 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none text-right" />
      <button onClick={() => name && price && onSave({ name, price: parseFloat(price), emoji })} disabled={!name || !price} className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-blue disabled:opacity-40 text-white"><Check size={13} /></button>
      <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><X size={13} /></button>
    </div>
  )
}

// ── Product editor with modifier groups ─────────────────────────────────────

function ProductEditorModal({ product, currency, onSave, onClose }) {
  const { addModifierGroup, updateModifierGroup, deleteModifierGroup, addModifierOption, updateModifierOption, deleteModifierOption } = useMenuStore()
  const [name, setName] = useState(product.name)
  const [price, setPrice] = useState(product.price)
  const [emoji, setEmoji] = useState(product.emoji ?? '')
  const [newGroupName, setNewGroupName] = useState('')
  const [newOptions, setNewOptions] = useState({})  // groupId → { name, price }

  const currentProduct = useMenuStore.getState().products.find((p) => p.id === product.id) ?? product

  const handleSaveBasic = () => onSave({ name, price: parseFloat(price) || 0, emoji })

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-secondary w-full max-w-md rounded-2xl border border-surface-border flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border shrink-0">
          <h2 className="font-bold text-base">Editar producto</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Basic info */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="w-14 h-11 bg-surface-input border border-surface-border rounded-xl text-center text-2xl focus:outline-none" maxLength={2} placeholder="🍽" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="flex-1 h-11 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-sm focus:outline-none focus:border-brand-blue" />
            </div>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio" className="w-full h-11 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-sm focus:outline-none focus:border-brand-blue" />
            <button onClick={handleSaveBasic} className="w-full h-10 bg-brand-blue hover:bg-blue-500 rounded-xl font-semibold text-sm text-white">Guardar cambios</button>
          </div>

          {/* Modifier groups */}
          <div>
            <h3 className="font-semibold text-sm text-white mb-3">Grupos de modificadores</h3>
            <div className="space-y-3">
              {currentProduct.modifierGroups.map((group) => (
                <div key={group.id} className="bg-surface-card rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-semibold text-white">{group.name}</span>
                    <label className="flex items-center gap-1 text-xs text-gray-400">
                      <input type="checkbox" checked={group.required} onChange={(e) => updateModifierGroup(product.id, group.id, { required: e.target.checked })} className="accent-brand-blue" />
                      Requerido
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-400">
                      <input type="checkbox" checked={group.multiple} onChange={(e) => updateModifierGroup(product.id, group.id, { multiple: e.target.checked })} className="accent-brand-blue" />
                      Múltiple
                    </label>
                    <button onClick={() => deleteModifierGroup(product.id, group.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>

                  {/* Options */}
                  <div className="space-y-1">
                    {group.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <input value={opt.name} onChange={(e) => updateModifierOption(product.id, group.id, opt.id, { name: e.target.value })} className="flex-1 bg-surface-input border border-surface-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-blue" />
                        <input type="number" value={opt.price} onChange={(e) => updateModifierOption(product.id, group.id, opt.id, { price: parseFloat(e.target.value) || 0 })} className="w-16 bg-surface-input border border-surface-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-blue" placeholder="$0" />
                        <button onClick={() => deleteModifierOption(product.id, group.id, opt.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400"><X size={11} /></button>
                      </div>
                    ))}
                  </div>

                  {/* New option */}
                  <div className="flex gap-2">
                    <input
                      value={newOptions[group.id]?.name ?? ''}
                      onChange={(e) => setNewOptions((p) => ({ ...p, [group.id]: { ...p[group.id], name: e.target.value } }))}
                      placeholder="Nueva opción"
                      className="flex-1 bg-surface-input border border-surface-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-blue"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newOptions[group.id]?.name) {
                          addModifierOption(product.id, group.id, { name: newOptions[group.id].name, price: parseFloat(newOptions[group.id]?.price) || 0 })
                          setNewOptions((p) => ({ ...p, [group.id]: { name: '', price: '' } }))
                        }
                      }}
                    />
                    <input
                      type="number"
                      value={newOptions[group.id]?.price ?? ''}
                      onChange={(e) => setNewOptions((p) => ({ ...p, [group.id]: { ...p[group.id], price: e.target.value } }))}
                      placeholder="$0"
                      className="w-16 bg-surface-input border border-surface-border rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-blue"
                    />
                    <button
                      onClick={() => {
                        if (!newOptions[group.id]?.name) return
                        addModifierOption(product.id, group.id, { name: newOptions[group.id].name, price: parseFloat(newOptions[group.id]?.price) || 0 })
                        setNewOptions((p) => ({ ...p, [group.id]: { name: '', price: '' } }))
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-brand-blue text-white text-xs"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New group */}
            <div className="flex gap-2 mt-3">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nombre del grupo (ej. Tipo de leche)"
                className="flex-1 h-9 bg-surface-input border border-surface-border rounded-xl px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newGroupName) {
                    addModifierGroup(product.id, { name: newGroupName })
                    setNewGroupName('')
                  }
                }}
              />
              <button
                onClick={() => { if (newGroupName) { addModifierGroup(product.id, { name: newGroupName }); setNewGroupName('') } }}
                className="h-9 px-3 bg-brand-blue hover:bg-blue-500 rounded-xl text-sm font-semibold text-white"
              >
                + Grupo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
