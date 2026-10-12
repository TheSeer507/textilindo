import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { WhatsAppGlyph } from "../icons/WhatsAppGlyph";
import { money } from "../../config/store";
import { LOW_STOCK_THRESHOLD } from "../../data/products";
import { isAvailable, isSoldOut, priceRange, saleMode, unitOf } from "../../utils/catalog";
import { buildChatLink } from "../../utils/whatsapp";

const waButton =
  "mt-auto w-full inline-flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm py-2.5 rounded-xl leading-tight transition " +
  "ring-1 ring-inset ring-[#25D366] text-[#128C4A] hover:bg-[#25D366] hover:text-white " +
  "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40";

/* ==============================================================
   TARJETA DEL CATÁLOGO
   Lo que muestra y lo que hace su botón depende de cómo se vende el
   producto (ver saleMode en utils/catalog.js):

     single   un precio            → "$3.95 por yarda"  · Agregar / − n +
     options  varias presentaciones → "Desde $2.95"      · Ver opciones
     range    dos precios sin explicación → "$5.95 – $6.95" · Consultar
     consult  sin precio            → "Precio a consultar" · Consultar

   Con varias presentaciones no se agrega desde la tarjeta: hay que
   elegir cuál, y eso se hace en la página del producto.
============================================================== */
export function ProductCard({ product, cart, onAdd, onChangeQty, onRemove }) {
  const mode = saleMode(product);
  const range = priceRange(product);
  const unit = unitOf(product);
  const href = "#product/" + product.id;

  // En modo "single" todo gira alrededor de la única variante.
  const only = mode === "single" ? product.variants[0] : null;
  const inCartQty = only ? cart[only.id] || 0 : 0;
  // El "antes" y el -N% solo salen si de verdad hay un precio mayor que
  // comparar: sin `compareAt` no se anuncia un descuento que no existe.
  const onSale = !!only && only.compareAt > only.price;
  const off = onSale ? Math.round((1 - only.price / only.compareAt) * 100) : 0;
  const outOfStock = only ? !isAvailable(only) : isSoldOut(product);
  const lowStock = !!only && only.stock > 0 && only.stock <= LOW_STOCK_THRESHOLD;
  const atStockLimit = !!only && inCartQty >= (only.stock ?? Infinity);
  // La portada cuadrada pesa una fracción de la foto de galería; si un
  // producto no la tiene, se usa su primera foto.
  const cover = product.thumb ?? product.images?.[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <a
        href={href}
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
        <a href={href} className="text-left font-display font-semibold text-slate-900 mt-1 leading-snug hover:text-brand-primary">
          {product.name}
        </a>

        <div className="mt-2 mb-3">
          {mode === "consult" ? (
            // leading-7 iguala el alto de la línea del precio, para que las
            // tarjetas con y sin precio queden parejas en la misma fila.
            <p className="text-sm font-semibold text-slate-500 leading-7">Precio a consultar</p>
          ) : (
            <>
              <p className="flex items-baseline gap-x-2 flex-wrap">
                {mode === "options" && <span className="text-xs font-semibold text-slate-500">Desde</span>}
                {mode === "range" && range.min !== range.max ? (
                  // Dos cifras ocupan casi todo el ancho de la tarjeta en un
                  // teléfono angosto: van un punto más chicas ahí.
                  <span className="font-black text-lg sm:text-xl text-slate-900 tabular-nums">
                    {money(range.min)} – {money(range.max)}
                  </span>
                ) : (
                  <span className="font-black text-xl text-slate-900 tabular-nums">{money(range.min)}</span>
                )}
                {onSale && <span className="line-through text-sm text-slate-400">{money(only.compareAt)}</span>}
              </p>
              {unit.per && <p className="text-xs text-slate-500">{unit.per}</p>}
            </>
          )}
        </div>

        {lowStock && !outOfStock && (
          <p className="text-xs font-semibold text-orange-600 mb-2">¡Quedan {only.stock}!</p>
        )}

        {mode === "consult" ? (
          <a href={buildChatLink({ productName: product.name, askPrice: true })} target="_blank" rel="noreferrer" className={waButton}>
            <WhatsAppGlyph className="w-4 h-4 shrink-0" />
            Consultar
          </a>
        ) : mode === "range" ? (
          <a href={buildChatLink({ productName: product.name, range, unit: unit.one })} target="_blank" rel="noreferrer" className={waButton}>
            <WhatsAppGlyph className="w-4 h-4 shrink-0" />
            Consultar
          </a>
        ) : mode === "options" ? (
          <a
            href={href}
            className="mt-auto w-full text-center font-bold text-xs sm:text-sm py-2.5 rounded-xl transition leading-tight bg-slate-900 text-white hover:bg-brand-primary-dark"
          >
            Ver opciones
          </a>
        ) : inCartQty === 0 ? (
          <button
            onClick={() => onAdd(only.id)}
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
            variant={only}
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
