import { ShoppingCart, Truck } from "lucide-react";
import { CONFIG, money } from "../../config/store";
import { lineName, unitOf } from "../../utils/catalog";

export function CartItemsView({ items, totals, changeQty, removeItem }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ShoppingCart size={48} strokeWidth={1.5} className="mx-auto mb-4" />
        <p className="font-semibold text-slate-600">Tu carrito está vacío</p>
        <p className="text-sm mt-1">Agrega productos para comenzar tu pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(({ product, variant, qty }) => {
        const name = lineName(product, variant);
        const unit = unitOf(product);
        const atLimit = qty >= (variant.stock ?? Infinity);
        return (
          <div key={variant.id} className="flex gap-3 border border-slate-200 rounded-2xl p-3">
            {/* La foto real del producto: en el carrito es lo que le confirma
                al cliente que agregó lo que creía. El emoji sobre degradado
                queda solo como respaldo si un producto no tiene fotos. */}
            {product.images?.length ? (
              <img
                src={product.thumb ?? product.images[0]}
                alt={product.name}
                loading="lazy"
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ background: product.bg }}>
                {product.emoji}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 leading-snug">{name}</p>
              <p className="font-black text-slate-900 mt-1 tabular-nums">{money(variant.price * qty)}</p>
              {/* En telas se aclara la cuenta: sin esto, "3" al lado de un
                  precio no dice si son yardas ni a cómo sale cada una. */}
              {unit.short && (
                <p className="text-xs text-slate-500 tabular-nums">
                  {qty} {unit.short} × {money(variant.price)}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden text-sm">
                  <button
                    onClick={() => changeQty(variant.id, -1)}
                    className="px-2 py-1 font-bold hover:bg-slate-100"
                    aria-label={`Quitar una ${unit.one} de ${name}`}
                  >
                    −
                  </button>
                  <span className="min-w-7 px-1 text-center font-bold tabular-nums whitespace-nowrap">
                    {qty}
                    {unit.short && <span className="ml-0.5 text-xs">{unit.short}</span>}
                  </span>
                  <button
                    onClick={() => changeQty(variant.id, 1)}
                    disabled={atLimit}
                    className="px-2 py-1 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={`Agregar otra ${unit.one} de ${name}`}
                  >
                    +
                  </button>
                </div>
                <button onClick={() => removeItem(variant.id)} className="text-xs text-slate-400 hover:text-orange-600 underline">Quitar</button>
              </div>
              {atLimit && (
                <p className="text-xs text-orange-600 mt-1">Máximo disponible</p>
              )}
            </div>
          </div>
        );
      })}
      {totals.shipping > 0 && (
        <p className="text-xs text-brand-primary bg-brand-surface rounded-xl px-3 py-2 font-medium flex items-center gap-1.5">
          <Truck size={14} strokeWidth={2} className="shrink-0" /> Agrega {money(CONFIG.freeShippingOver - totals.subtotal)} más y tu envío es GRATIS
        </p>
      )}
    </div>
  );
}
