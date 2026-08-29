import { PROVINCES } from "../../data/provinces";

const inputCls = "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary";

export function ShippingForm({ form, set, error }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Nombre completo *</label>
        <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Ej. Ana Rodríguez" autoComplete="name" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Teléfono (WhatsApp) *</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-xl bg-slate-50 text-sm font-semibold">+507</span>
          <input className={inputCls + " rounded-l-none"} value={form.phone} onChange={set("phone")} placeholder="6123-4567" inputMode="numeric" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Provincia / Comarca *</label>
        <select className={inputCls + " bg-white"} value={form.province} onChange={set("province")}>
          <option value="">Selecciona…</option>
          {PROVINCES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Ciudad / Sector / Barriada *</label>
        <input className={inputCls} value={form.city} onChange={set("city")} placeholder="Ej. San Miguelito, Villa Lucre" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Notas de entrega (opcional)</label>
        <textarea className={inputCls + " resize-none"} rows={2} value={form.notes} onChange={set("notes")} placeholder="Punto de referencia, edificio, horario…" />
      </div>
      {error && <p className="text-sm font-semibold text-orange-600">{error}</p>}
    </div>
  );
}
