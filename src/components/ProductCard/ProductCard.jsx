import { Minus, Plus, Trash2 } from "lucide-react";
import { money } from "../../config/store";
import { LOW_STOCK_THRESHOLD } from "../../data/products";

export function ProductCard({ product, inCartQty, onAdd, onChangeQty, onRemove }) {
  const off = Math.round((1 - product.price / product.compareAt) * 100);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const atStockLimit = inCartQty >= product.stock;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <a
        href={"#product/" + product.id}
        className="relative aspect-square flex items-center justify-center text-6xl overflow-hidden"
        style={product.images?.length ? undefined : { background: product.bg }}
        aria-label={"Ver " + product.name}
      >
        {product.images?.length ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className={"w-full h-full object-cover group-hover:scale-110 transition-transform" + (outOfStock ? " opacity-40 grayscale" : "")}
          />
        ) : (
          <span className={"group-hover:scale-110 transition-transform" + (outOfStock ? " opacity-40 grayscale" : "")}>{product.emoji}</span>
        )}
        {outOfStock ? (
          <span className="absolute top-3 left-3 bg-slate-700 text-white text-xs font-bold px-2 py-1 rounded-full">Agotado</span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 bg-brand-accent text-brand-primary text-xs font-bold px-2 py-1 rounded-full">{product.badge}</span>
        ) : null}
        <span className="absolute top-3 right-3 bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full shadow">-{off}%</span>
      </a>
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">{product.category}</p>
        <a href={"#product/" + product.id} className="text-left font-display font-semibold text-slate-900 mt-1 leading-snug hover:text-brand-primary">
          {product.name}
        </a>
        <div className="mt-2 mb-3 flex items-baseline gap-2 flex-wrap">
          <span className="font-black text-xl text-slate-900">{money(product.price)}</span>
          <span className="line-through text-sm text-slate-400">{money(product.compareAt)}</span>
        </div>
        {lowStock && !outOfStock && (
          <p className="text-xs font-semibold text-orange-600 mt-1">¡Quedan {product.stock}!</p>
        )}
        {/* Sin nada en el carrito: un solo botón. Ya con unidades: el
            botón se convierte en control de cantidad (− / n / +) más
            papelera para sacar el producto completo. */}
        {inCartQty === 0 ? (
          <button
            onClick={() => onAdd(product.id)}
            disabled={outOfStock}
            className={
              "mt-auto w-full font-bold text-xs sm:text-sm py-2.5 rounded-xl transition leading-tight " +
              (outOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-brand-primary-dark")
            }
          >
            {outOfStock ? "Agotado" : "Agregar"}
          </button>
        ) : (
          <div className="mt-auto flex items-center gap-1.5">
            <button
              onClick={() => onRemove(product.id)}
              aria-label={`Quitar ${product.name} del carrito`}
              title="Quitar del carrito"
              className="shrink-0 w-8 sm:w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} strokeWidth={2} />
            </button>

            <div className="flex-1 flex items-center justify-between rounded-xl border border-brand-primary bg-brand-surface h-9 px-1">
              <button
                onClick={() => onChangeQty(product.id, -1)}
                aria-label={`Quitar una unidad de ${product.name}`}
                className="shrink-0 w-6 sm:w-7 h-7 flex items-center justify-center rounded-lg text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
              >
                <Minus size={14} strokeWidth={3} />
              </button>

              <span
                aria-live="polite"
                className="font-black text-sm text-brand-primary tabular-nums text-center flex-1 min-w-0"
              >
                {inCartQty}
              </span>

              <button
                onClick={() => onAdd(product.id)}
                disabled={atStockLimit}
                aria-label={`Agregar otra unidad de ${product.name}`}
                title={atStockLimit ? `Solo quedan ${product.stock}` : undefined}
                className={
                  "shrink-0 w-6 sm:w-7 h-7 flex items-center justify-center rounded-lg transition-colors " +
                  (atStockLimit
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-brand-primary hover:bg-brand-primary hover:text-white")
                }
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {atStockLimit && inCartQty > 0 && (
          <p className="text-[10px] font-semibold text-slate-400 mt-1.5 text-center leading-tight">
            Máximo disponible
          </p>
        )}
      </div>
    </div>
  );
}
