import { PROVINCES } from "../../data/provinces";
import { formatPanamaPhone } from "../../utils/phone";

// text-base (16px) is deliberate: iOS Safari zooms the viewport when a
// focused input is smaller than 16px, which looks like the layout breaking.
const inputCls = "w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-brand-primary";

export function ShippingForm({
  form, set, setPhone, error,
  signedIn, prefilled, saveData, setSaveData,
}) {
  return (
    <div className="space-y-4">
      {prefilled && (
        <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          Completamos tus datos guardados. Revísalos por si algo cambió.
        </p>
      )}
      {!signedIn && (
        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <a href="#login" className="font-bold text-brand-primary hover:underline">Inicia sesión</a>{" "}
          para que la próxima vez se llene solo.
        </p>
      )}
      <div>
        <label className="block text-sm font-semibold mb-1">Nombre completo *</label>
        <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Ej. Ana Rodríguez" autoComplete="name" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Teléfono (WhatsApp) *</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-xl bg-slate-50 text-base font-semibold shrink-0">+507</span>
          <input
            className={inputCls + " rounded-l-none"}
            value={formatPanamaPhone(form.phone)}
            onChange={setPhone}
            placeholder="6123-4567"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={9}
          />
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
      {signedIn && (
        <label className="flex items-start gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <input
            type="checkbox"
            checked={saveData}
            onChange={(e) => setSaveData(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[oklch(0.55_0.24_29)] shrink-0"
          />
          <span className="text-sm text-slate-700">
            Guardar estos datos para mis próximos pedidos
          </span>
        </label>
      )}

      {error && <p className="text-sm font-semibold text-orange-600">{error}</p>}
    </div>
  );
}
