import { Minus, Plus, Trash2 } from "lucide-react";

/* ==============================================================
   CONTROL DE CANTIDAD
   Papelera + (− n +). Reemplaza al botón "Agregar" en cuanto el
   producto ya está en el carrito, tanto en la tarjeta del catálogo
   como en la página del producto.

   `size`:
     "sm" → tarjetas (a 2 columnas en 360px quedan ~130px de ancho)
     "lg" → página de producto, a la altura del botón principal

   El "+" pasa por onAdd (no por onChangeQty) para reutilizar el
   mismo camino de alta: respeta el stock y dispara el toast.
============================================================== */
export function QuantityStepper({ product, qty, onAdd, onChangeQty, onRemove, size = "sm" }) {
  const atStockLimit = qty >= product.stock;
  const lg = size === "lg";

  const box = lg ? "h-14" : "h-9";
  const trashW = lg ? "w-14" : "w-8 sm:w-9";
  const btn = lg ? "w-11 h-11" : "w-6 sm:w-7 h-7";
  const icon = lg ? 18 : 14;
  const num = lg ? "text-xl" : "text-sm";

  return (
    <div className={`flex items-center gap-2 ${lg ? "" : "mt-auto"}`}>
      <button
        onClick={() => onRemove(product.id)}
        aria-label={`Quitar ${product.name} del carrito`}
        title="Quitar del carrito"
        className={`shrink-0 ${trashW} ${box} flex items-center justify-center rounded-2xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors`}
      >
        <Trash2 size={icon + 1} strokeWidth={2} />
      </button>

      <div className={`flex-1 flex items-center justify-between rounded-2xl border-2 border-brand-primary bg-brand-surface ${box} px-1.5`}>
        <button
          onClick={() => onChangeQty(product.id, -1)}
          aria-label={`Quitar una unidad de ${product.name}`}
          className={`shrink-0 ${btn} flex items-center justify-center rounded-xl text-brand-primary hover:bg-brand-primary hover:text-white transition-colors`}
        >
          <Minus size={icon} strokeWidth={3} />
        </button>

        <span
          aria-live="polite"
          className={`font-black ${num} text-brand-primary tabular-nums text-center flex-1 min-w-0`}
        >
          {qty}
        </span>

        <button
          onClick={() => onAdd(product.id)}
          disabled={atStockLimit}
          aria-label={`Agregar otra unidad de ${product.name}`}
          title={atStockLimit ? `Solo quedan ${product.stock}` : undefined}
          className={
            `shrink-0 ${btn} flex items-center justify-center rounded-xl transition-colors ` +
            (atStockLimit
              ? "text-slate-300 cursor-not-allowed"
              : "text-brand-primary hover:bg-brand-primary hover:text-white")
          }
        >
          <Plus size={icon} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
