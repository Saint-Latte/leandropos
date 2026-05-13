import { useState } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import useSettingsStore from '../store/settingsStore'

export default function Settings() {
  const settings = useSettingsStore()
  const [form, setForm] = useState({
    businessName: settings.businessName,
    currency: settings.currency,
    address: settings.address,
    phone: settings.phone,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    settings.update(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-surface">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-border bg-surface-secondary shrink-0">
        <SettingsIcon size={18} className="text-gray-400" />
        <h1 className="font-bold text-base">Configuración</h1>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        <div className="bg-surface-card rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-300">Negocio</h2>

          {[
            { key: 'businessName', label: 'Nombre del negocio', placeholder: 'Leandro Valle' },
            { key: 'address', label: 'Dirección', placeholder: 'Calle, Ciudad' },
            { key: 'phone', label: 'Teléfono', placeholder: '000 000 0000' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-sm focus:outline-none focus:border-brand-blue"
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-500 block mb-1">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-sm focus:outline-none focus:border-brand-blue"
            >
              <option value="MXN">MXN — Peso mexicano</option>
              <option value="USD">USD — Dólar americano</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full h-11 flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-500 rounded-xl font-bold text-sm text-white transition-colors"
        >
          <Save size={16} />
          {saved ? '¡Guardado!' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
