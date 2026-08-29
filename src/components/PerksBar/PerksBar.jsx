import { Truck, Wallet, RotateCcw } from "lucide-react";

const PERKS = [
  { Icon: Truck, title: "Entrega rápida", desc: "24–48 h en Ciudad de Panamá, 2–4 días al interior." },
  { Icon: Wallet, title: "Paga como quieras", desc: "Efectivo contra entrega o Yappy. Tarjetas muy pronto." },
  { Icon: RotateCcw, title: "Garantía 30 días", desc: "Si no te encanta, te devolvemos tu dinero." },
];

export function PerksBar() {
  return (
    <section className="bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-3 gap-8">
        {PERKS.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-4">
            <div className="w-11 h-11 shrink-0 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center">
              <Icon size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="font-display font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500 mt-1">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
