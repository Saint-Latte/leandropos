import { useState } from 'react'
import { Settings as SettingsIcon, Save, Send, CheckCircle, Eye, EyeOff, ShieldCheck, Bell, Wifi, WifiOff, Loader } from 'lucide-react'
import useSettingsStore from '../store/settingsStore'
import usePolotabStore from '../store/polotabStore'
import { sendTelegram } from '../lib/telegram'
import PinModal from '../components/common/PinModal'

export default function Settings() {
  const settings = useSettingsStore()
  const [unlocked, setUnlocked] = useState(false)
  const [form, setForm] = useState({
    businessName: settings.businessName,
    businessSubtitle: settings.businessSubtitle,
    currency: settings.currency,
    address: settings.address,
    phone: settings.phone,
    telegramEnabled: settings.telegramEnabled,
    telegramToken: settings.telegramToken,
    telegramChatId: settings.telegramChatId,
    adminPin: settings.adminPin,
    inactivityMinutes: settings.inactivityMinutes,
    hourlyReport: settings.hourlyReport,
  })
  const { connected, connecting, error: polotabError, connect, disconnect } = usePolotabStore()
  const [saved, setSaved] = useState(false)
  const [testStatus, setTestStatus] = useState(null)
  const [showPin, setShowPin] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [polotabForm, setPolotabForm] = useState({
    apiKey: settings.polotabApiKey ?? '',
    restaurantId: settings.polotabRestaurantId ?? '',
  })

  const handleSave = () => {
    settings.update(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTest = async () => {
    setTestStatus('sending')
    try {
      const res = await fetch(`https://api.telegram.org/bot${form.telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: form.telegramChatId,
          text: `✅ <b>Conexión exitosa — ${form.businessName}</b>\nLas notificaciones están funcionando correctamente.`,
          parse_mode: 'HTML',
        }),
      })
      setTestStatus(res.ok ? 'ok' : 'error')
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus(null), 3000)
  }

  if (!unlocked) {
    return (
      <PinModal
        title="Acceso a Configuración"
        subtitle="Solo el administrador puede modificar los ajustes"
        correctPin={settings.adminPin}
        onSuccess={() => setUnlocked(true)}
      />
    )
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
            { key: 'businessName', label: 'Nombre del negocio', placeholder: 'Saint Latte' },
            { key: 'businessSubtitle', label: 'Subtítulo', placeholder: 'Specialty Coffee Shop' },
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

        {/* Telegram */}
        <div className="bg-surface-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-300">Notificaciones Telegram</h2>
            <button
              onClick={() => setForm((f) => ({ ...f, telegramEnabled: !f.telegramEnabled }))}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.telegramEnabled ? 'bg-brand-blue' : 'bg-surface-border'}`}
            >
              <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${form.telegramEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {form.telegramEnabled && (
            <>
              {[
                { key: 'telegramToken', label: 'Token del bot', placeholder: '123456:ABC...' },
                { key: 'telegramChatId', label: 'Chat ID', placeholder: '1234567890' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-sm focus:outline-none focus:border-brand-blue font-mono"
                  />
                </div>
              ))}
              <button
                onClick={handleTest}
                disabled={testStatus === 'sending'}
                className={`w-full h-10 flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-colors ${
                  testStatus === 'ok' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  testStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-surface-input border border-surface-border text-gray-300 hover:border-gray-500'
                }`}
              >
                {testStatus === 'ok' ? <><CheckCircle size={15} /> Mensaje enviado</> :
                 testStatus === 'error' ? 'Error — revisa el token' :
                 testStatus === 'sending' ? 'Enviando...' :
                 <><Send size={15} /> Probar conexión</>}
              </button>
            </>
          )}
        </div>

        {/* Admin PIN */}
        <div className="bg-surface-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-orange" />
            <h2 className="font-semibold text-sm text-gray-300">PIN de administrador</h2>
          </div>
          <p className="text-xs text-gray-500">Requerido para abrir/cerrar caja, eliminar egresos y ver reportes.</p>
          <div>
            <label className="text-xs text-gray-500 block mb-1">PIN (4 dígitos)</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={form.adminPin}
                onChange={(e) => setForm((f) => ({ ...f, adminPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 pr-10 text-white text-sm tracking-widest font-mono focus:outline-none focus:border-brand-blue"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Alert settings */}
        <div className="bg-surface-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-yellow-400" />
            <h2 className="font-semibold text-sm text-gray-300">Alertas automáticas</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Reporte por hora</p>
              <p className="text-xs text-gray-500">Resumen de ventas cada hora a tu Telegram</p>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, hourlyReport: !f.hourlyReport }))}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.hourlyReport ? 'bg-brand-blue' : 'bg-surface-border'}`}
            >
              <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transition-transform ${form.hourlyReport ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Alerta de inactividad (minutos)</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.inactivityMinutes}
              onChange={(e) => setForm((f) => ({ ...f, inactivityMinutes: parseInt(e.target.value) || 0 }))}
              placeholder="30"
              className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-sm focus:outline-none focus:border-brand-blue"
            />
            <p className="text-xs text-gray-500 mt-1">0 = desactivado</p>
          </div>
        </div>

        {/* Polotab */}
        <div className="bg-surface-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-brand-green' : 'bg-gray-600'}`} />
              <h2 className="font-semibold text-sm text-gray-300">Polotab</h2>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              connected ? 'bg-brand-green/20 text-brand-green' : 'bg-surface-border text-gray-500'
            }`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={polotabForm.apiKey}
                onChange={(e) => setPolotabForm(f => ({ ...f, apiKey: e.target.value }))}
                placeholder="krzV4HPL..."
                className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 pr-10 text-white text-xs font-mono focus:outline-none focus:border-brand-blue"
              />
              <button type="button" onClick={() => setShowApiKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Restaurant ID</label>
            <input
              type="text"
              value={polotabForm.restaurantId}
              onChange={(e) => setPolotabForm(f => ({ ...f, restaurantId: e.target.value }))}
              placeholder="0a717e1b-ffd5-..."
              className="w-full h-10 bg-surface-input border border-surface-border rounded-xl px-4 text-white text-xs font-mono focus:outline-none focus:border-brand-blue"
            />
          </div>

          {polotabError && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{polotabError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => connect(polotabForm.apiKey, polotabForm.restaurantId)}
              disabled={connecting || !polotabForm.apiKey || !polotabForm.restaurantId}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue border border-brand-blue/30 rounded-xl font-semibold text-sm disabled:opacity-40 transition-colors"
            >
              {connecting ? <Loader size={14} className="animate-spin" /> : <Wifi size={14} />}
              {connecting ? 'Conectando...' : connected ? 'Reconectar' : 'Conectar'}
            </button>
            {connected && (
              <button
                onClick={disconnect}
                className="h-10 px-4 flex items-center justify-center gap-2 border border-surface-border rounded-xl text-gray-400 hover:text-red-400 hover:border-red-500/30 text-sm transition-colors"
              >
                <WifiOff size={14} />
              </button>
            )}
          </div>

          {connected && (
            <p className="text-xs text-gray-600">
              ✓ Los pedidos se imprimirán automáticamente en la tablet al cobrar
            </p>
          )}
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
