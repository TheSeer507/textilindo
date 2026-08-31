import { money } from "../../config/store";
import { LOW_STOCK_THRESHOLD } from "../../data/products";

export function ProductCard({ product, inCartQty, onAdd }) {
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
        <button
          onClick={() => onAdd(product.id)}
          disabled={outOfStock || atStockLimit}
          className={
            "mt-auto w-full font-bold text-xs sm:text-sm py-2.5 rounded-xl transition leading-tight " +
            (outOfStock || atStockLimit
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : inCartQty
              ? "bg-brand-surface text-brand-primary border border-brand-primary"
              : "bg-slate-900 text-white hover:bg-brand-primary-dark")
          }
        >
          {outOfStock
            ? "Agotado"
            : atStockLimit
            ? `Máximo disponible (${product.stock})`
            : inCartQty
            ? `✓ En carrito (${inCartQty}) · +1`
            : "Agregar"}
        </button>
      </div>
    </div>
  );
}
