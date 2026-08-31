import { useEffect } from "react";
import { Check, ShoppingBag } from "lucide-react";

/* ==============================================================
   "AGREGADO" TOAST
   Confirmación de que el producto entró al carrito. En móvil el
   carrito vive arriba y fuera del pulgar, así que sin esto el
   cliente toca "Agregar" y no ve que pasó nada.

   Aparece abajo (donde está la mano), por encima del botón de
   WhatsApp, y ofrece "Ver" para cerrar el ciclo de compra.

   Entrada y salida son una sola animación CSS: el `key` del padre
   remonta el nodo en cada alta y la vuelve a correr, así que no
   hace falta estado de visibilidad aquí.
============================================================== */
export function AddedToast({ lastAdded, onOpenCart, onDismiss }) {
  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(onDismiss, 3000); // debe coincidir con la animación
    return () => clearTimeout(t);
  }, [lastAdded, onDismiss]);

  if (!lastAdded) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed left-1/2 -translate-x-1/2 z-40 w-[min(22rem,calc(100vw-2rem))]
        bottom-[calc(5.5rem+env(safe-area-inset-bottom))]
        sm:bottom-6 sm:left-6 sm:translate-x-0
      "
    >
      <div key={lastAdded.key} className="animate-toast flex items-center gap-3 bg-slate-900 text-white rounded-2xl shadow-2xl px-4 py-3">
        <span className="shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={18} strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">Agregado al carrito</p>
          <p className="text-xs text-slate-300 truncate">{lastAdded.name}</p>
        </div>
        <button
          onClick={onOpenCart}
          className="shrink-0 flex items-center gap-1.5 bg-brand-accent text-brand-primary text-xs font-black px-3 py-2 rounded-xl hover:bg-brand-accent-dark transition-colors"
        >
          <ShoppingBag size={14} strokeWidth={2.5} /> Ver
        </button>
      </div>
    </div>
  );
}
