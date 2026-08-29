import { CONFIG } from "../../config/store";
import { PAYMENT_METHODS } from "../../data/paymentMethods";

export function PaymentMethods({ payMethod, setPayMethod, setError, error }) {
  return (
    <div className="space-y-3">
      {PAYMENT_METHODS.map((m) => (
        <button
          key={m.id}
          disabled={!m.enabled}
          onClick={() => { setPayMethod(m.id); setError(""); }}
          className={
            "w-full text-left border-2 rounded-2xl p-4 transition " +
            (!m.enabled
              ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
              : payMethod === m.id
              ? "border-brand-primary bg-brand-surface"
              : "border-slate-200 hover:border-slate-300")
          }
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900">{m.label}</span>
            <span className={"text-xs font-bold px-2 py-1 rounded-full " + (m.enabled ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-200 text-slate-500")}>
              {m.tag}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{m.desc}</p>
        </button>
      ))}
      {payMethod === "yappy-manual" && (
        <div className="border border-dashed border-brand-primary/40 bg-brand-surface rounded-2xl p-4 flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400 text-center leading-tight">
            TU QR<br />YAPPY<br />AQUÍ
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-900">Directorio Yappy:</p>
            <p className="text-brand-primary font-semibold">{CONFIG.yappyHandle}</p>
          </div>
        </div>
      )}
      {error && <p className="text-sm font-semibold text-orange-600">{error}</p>}
    </div>
  );
}
