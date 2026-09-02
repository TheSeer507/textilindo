import { ShoppingBag, ArrowRight } from "lucide-react";
import { money } from "../../config/store";

/* ==============================================================
   BARRA DE CHECKOUT (solo móvil)
   El carrito del header queda arriba a la derecha: siempre visible
   por ser sticky, pero lejos del pulgar y visualmente callado. Esta
   barra pone el camino a la compra donde la mano ya está.

   Aparece únicamente cuando hay algo en el carrito, así que no le
   quita pantalla a quien todavía está mirando el catálogo.

   Muestra el SUBTOTAL, no el total: el envío depende del umbral y
   el ITBMS se calcula al final. Prometer aquí una cifra distinta a
   la de la gaveta sería peor que no mostrar ninguna.
============================================================== */
export function CheckoutBar({ count, subtotal, onOpenCart, hidden = false }) {
  if (count === 0) return null;

  return (
    <div
      className={`
        sm:hidden fixed inset-x-0 bottom-0 z-30
        bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
        pb-[env(safe-area-inset-bottom)]
        transition-transform duration-300
        ${hidden ? "translate-y-full" : "translate-y-0 animate-slide-up"}
      `}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <ShoppingBag size={13} strokeWidth={2.5} className="shrink-0" />
            {count} {count === 1 ? "producto" : "productos"}
          </p>
          <p className="font-black text-lg text-slate-900 leading-tight tabular-nums">
            {money(subtotal)}
            <span className="ml-1.5 text-xs font-semibold text-slate-400">subtotal</span>
          </p>
        </div>

        <button
          onClick={onOpenCart}
          className="shrink-0 flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-black px-5 py-3.5 rounded-2xl transition-colors"
        >
          Ver carrito
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
