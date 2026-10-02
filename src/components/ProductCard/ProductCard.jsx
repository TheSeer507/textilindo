import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { WhatsAppGlyph } from "../icons/WhatsAppGlyph";
import { money } from "../../config/store";
import { LOW_STOCK_THRESHOLD, hasPrice } from "../../data/products";
import { buildChatLink } from "../../utils/whatsapp";

export function ProductCard({ product, inCartQty, onAdd, onChangeQty, onRemove }) {
  const priced = hasPrice(product);
  // El "antes" y el -N% solo salen si de verdad hay un precio mayor que
  // comparar: un producto sin `compareAt` no anuncia un descuento que no existe.
  const onSale = priced && product.compareAt > product.price;
  const off = onSale ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const atStockLimit = inCartQty >= product.stock;
  // La portada cuadrada pesa una fracción de la foto de galería; los
  // productos de muestra no la tienen y usan su primera foto.
  const cover = product.thumb ?? product.images?.[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <a
        href={"#product/" + product.id}
        className="relative aspect-square flex items-center justify-center text-6xl overflow-hidden"
        style={cover ? undefined : { background: product.bg }}
        aria-label={"Ver " + product.name}
      >
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            decoding="async"
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
        {onSale && (
          <span className="absolute top-3 right-3 bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded-full shadow">-{off}%</span>
        )}
      </a>
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">{product.category}</p>
        <a href={"#product/" + product.id} className="text-left font-display font-semibold text-slate-900 mt-1 leading-snug hover:text-brand-primary">
          {product.name}
        </a>
        <div className="mt-2 mb-3 flex items-baseline gap-2 flex-wrap">
          {priced ? (
            <>
              <span className="font-black text-xl text-slate-900">{money(product.price)}</span>
              {onSale && <span className="line-through text-sm text-slate-400">{money(product.compareAt)}</span>}
            </>
          ) : (
            // leading-7 iguala el alto de la línea del precio, para que las
            // tarjetas con y sin precio queden parejas en la misma fila.
            <span className="text-sm font-semibold text-slate-500 leading-7">Precio a consultar</span>
          )}
        </div>
        {lowStock && !outOfStock && (
          <p className="text-xs font-semibold text-orange-600 mt-1">¡Quedan {product.stock}!</p>
        )}
        {/* Tres estados del botón:
            - sin precio publicado: se consulta por WhatsApp, no hay carrito;
            - con precio y nada en el carrito: un solo botón;
            - ya con unidades: control de cantidad (− / n / +) y papelera. */}
        {!priced ? (
          <a
            href={buildChatLink({ productName: product.name, askPrice: true })}
            target="_blank"
            rel="noreferrer"
            className="mt-auto w-full inline-flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm py-2.5 rounded-xl leading-tight transition ring-1 ring-inset ring-[#25D366] text-[#128C4A] hover:bg-[#25D366] hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
          >
            <WhatsAppGlyph className="w-4 h-4 shrink-0" />
            Consultar
          </a>
        ) : inCartQty === 0 ? (
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
          <QuantityStepper
            product={product}
            qty={inCartQty}
            onAdd={onAdd}
            onChangeQty={onChangeQty}
            onRemove={onRemove}
          />
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
