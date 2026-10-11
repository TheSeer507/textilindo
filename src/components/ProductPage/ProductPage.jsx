import { useEffect, useState } from "react";
import { money, CONFIG } from "../../config/store";
import { LOW_STOCK_THRESHOLD } from "../../data/products";
import {
  hasPrice, isAvailable, isSelectable, lineName, priceRange, qtyLabel, saleMode, unitOf,
} from "../../utils/catalog";
import { ImageGallery } from "../ImageGallery/ImageGallery";
import { ProductCard } from "../ProductCard/ProductCard";
import { WhatsAppGlyph } from "../icons/WhatsAppGlyph";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { buildChatLink } from "../../utils/whatsapp";

export function ProductPage({ product, products, cart, onAdd, onChangeQty, onRemove }) {
  useEffect(() => {
    document.title = `${product.name} — ${CONFIG.storeName}`;
    return () => { document.title = CONFIG.storeName; };
  }, [product]);

  const mode = saleMode(product);
  const unit = unitOf(product);
  const range = priceRange(product);
  // "single" y "options" se compran en línea; "range" y "consult" se
  // resuelven por WhatsApp (ver saleMode en utils/catalog.js).
  const buyable = mode === "single" || mode === "options";

  /* La presentación elegida. `pickedId` es lo último que tocó el cliente,
     pero solo vale si pertenece a ESTE producto: la página no se desmonta
     al pasar de un producto a otro, y sin esa comprobación Encaje
     arrancaría con la elección hecha en Organza. Si no hay elección
     válida, va la primera que se pueda comprar. */
  const [pickedId, setPickedId] = useState(null);
  const selectable = product.variants.filter((v) => isSelectable(product, v));
  const variant = buyable
    ? selectable.find((v) => v.id === pickedId) ?? selectable.find(isAvailable) ?? selectable[0]
    : null;

  const inCartQty = variant ? cart[variant.id] || 0 : 0;
  const onSale = !!variant && variant.compareAt > variant.price;
  const outOfStock = !!variant && !isAvailable(variant);
  const lowStock = !!variant && variant.stock > 0 && variant.stock <= LOW_STOCK_THRESHOLD;
  const atStockLimit = !!variant && inCartQty >= (variant.stock ?? Infinity);
  // Al preguntar por WhatsApp se nombra la presentación que está viendo.
  const askName = variant ? lineName(product, variant) : product.name;

  /* Varias categorías tienen un solo producto (Organza, Tull, Encaje…),
     y ahí "Más de la categoría" quedaba vacío y la página terminaba en
     seco. Se completa con los productos que siguen en el catálogo, para
     que siempre haya a dónde seguir mirando. Sin azar: el mismo producto
     muestra siempre las mismas sugerencias. */
  const at = products.findIndex((p) => p.id === product.id);
  const following = [...products.slice(at + 1), ...products.slice(0, at)];
  const sameCategory = following.filter((p) => p.category === product.category);
  // Cuatro: en móvil la grilla es de dos columnas y tres dejaban una
  // tarjeta suelta. En escritorio (tres columnas) la cuarta se oculta.
  const related = [...sameCategory, ...following.filter((p) => p.category !== product.category)].slice(0, 4);
  const relatedTitle = related.every((p) => p.category === product.category)
    ? `Más de ${product.category}`
    : "También te puede interesar";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <a href="#" className="text-sm font-semibold text-slate-500 hover:text-brand-primary">
        ← Volver al catálogo
      </a>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-6">
        {product.images?.length ? (
          // `key`: sin él, la galería conserva el número de foto al pasar de un
          // producto a otro, y venir de la foto 4 de Hilos a un producto con
          // dos fotos dejaba la imagen rota.
          <ImageGallery key={product.id} images={product.images} thumbs={product.minis} alt={product.name} />
        ) : (
          <div className="aspect-square rounded-xl flex items-center justify-center text-9xl" style={{ background: product.bg }}>
            <span className={outOfStock ? "opacity-40 grayscale" : ""}>{product.emoji}</span>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">{product.category}</p>
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-slate-900 mt-1 tracking-tight">
            {product.name}
          </h1>

          {/* ---- Precio ---- */}
          {mode === "consult" ? (
            <div className="mt-4">
              <p className="font-black text-2xl text-slate-900">Precio a consultar</p>
              <p className="text-sm text-slate-500 mt-1">
                Te lo damos al momento por WhatsApp, junto con los colores disponibles.
              </p>
            </div>
          ) : mode === "range" ? (
            <div className="mt-4">
              <p className="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
                <span className="font-black text-3xl text-slate-900 tabular-nums">
                  {money(range.min)}
                  {range.max !== range.min && <> – {money(range.max)}</>}
                </span>
                {unit.per && <span className="text-base font-semibold text-slate-500">{unit.per}</span>}
              </p>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                Hay más de un precio para este producto. Escríbenos y te confirmamos
                cuál corresponde al que buscas.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-baseline gap-x-3 gap-y-1 flex-wrap">
              <span className="font-black text-3xl text-slate-900 tabular-nums">{money(variant.price)}</span>
              {unit.per && <span className="text-base font-semibold text-slate-500">{unit.per}</span>}
              {onSale && <span className="line-through text-lg text-slate-400">{money(variant.compareAt)}</span>}
            </div>
          )}

          {outOfStock ? (
            <p className="text-sm font-semibold text-slate-500 mt-3">Agotado por ahora</p>
          ) : lowStock ? (
            <p className="text-sm font-semibold text-orange-600 mt-3">¡Quedan {variant.stock}!</p>
          ) : null}

          <p className="text-slate-600 mt-5 leading-relaxed max-w-md">{product.desc}</p>

          {/* ---- Presentaciones (ancho, tipo…) ----
              Cada una es un renglón aparte en el carrito, con su precio. */}
          {mode === "options" && (
            <fieldset className="mt-6 max-w-md">
              <legend className="text-sm font-semibold text-slate-700">Elige una opción</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const can = isSelectable(product, v);
                  const chosen = v.id === variant.id;
                  const inCart = cart[v.id] || 0;
                  return (
                    <label
                      key={v.id}
                      className={
                        "relative rounded-2xl border-2 px-4 py-3 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-primary/25 " +
                        (!can
                          ? "border-slate-200 bg-white/50 opacity-60 cursor-not-allowed"
                          : chosen
                          ? "border-brand-primary bg-white cursor-pointer"
                          : "border-slate-200 bg-white hover:border-slate-400 cursor-pointer")
                      }
                    >
                      <input
                        type="radio"
                        name={`opcion-${product.id}`}
                        className="sr-only"
                        checked={chosen}
                        disabled={!can}
                        onChange={() => setPickedId(v.id)}
                      />
                      <span className="block font-bold text-sm text-slate-900 leading-snug">
                        {v.label ?? "Otra presentación"}
                      </span>
                      <span className="block text-sm text-slate-600 mt-0.5">
                        {hasPrice(v) ? (
                          <>
                            <span className="font-black text-slate-900 tabular-nums">{money(v.price)}</span>
                            {unit.per && <> {unit.per}</>}
                          </>
                        ) : (
                          "Precio a consultar"
                        )}
                      </span>
                      {can && !isAvailable(v) && (
                        <span className="block text-xs font-semibold text-slate-500 mt-1">Agotada</span>
                      )}
                      {inCart > 0 && (
                        <span className="block text-xs font-semibold text-brand-primary mt-1">
                          En tu carrito: {qtyLabel(product, inCart)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* ---- Acción ----
              Sin poder comprarse en línea, la única acción es preguntar:
              WhatsApp pasa a ser el botón principal. */}
          {!buyable ? (
            <div className="mt-8">
              <a
                href={
                  mode === "range"
                    ? buildChatLink({ productName: product.name, range, unit: unit.one })
                    : buildChatLink({ productName: product.name, askPrice: true })
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-14 font-black px-8 rounded-2xl transition bg-[#0F7A40] hover:bg-[#0c6635] text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
              >
                <WhatsAppGlyph className="w-5 h-5" />
                {mode === "range" ? "Consultar por WhatsApp" : "Consultar precio por WhatsApp"}
              </a>
            </div>
          ) : (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {/* Igual que en la tarjeta: una vez que hay algo en el carrito,
                  el botón cede su lugar al control de cantidad. */}
              {inCartQty > 0 && !outOfStock ? (
                <div className="sm:w-64">
                  <QuantityStepper
                    product={product}
                    variant={variant}
                    qty={inCartQty}
                    onAdd={onAdd}
                    onChangeQty={onChangeQty}
                    onRemove={onRemove}
                    size="lg"
                  />
                </div>
              ) : (
                <button
                  onClick={() => onAdd(variant.id)}
                  disabled={outOfStock}
                  className={
                    "h-14 font-black px-8 rounded-2xl transition " +
                    (outOfStock
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-brand-accent hover:bg-brand-accent-dark text-brand-primary")
                  }
                >
                  {outOfStock ? "Agotado" : "Agregar al carrito"}
                </button>
              )}

              {/* Cuando está agotado, consultar es la única acción útil que
                  queda — así que ahí se vuelve el botón principal. */}
              <a
                href={buildChatLink({ productName: askName, outOfStock })}
                target="_blank"
                rel="noreferrer"
                className={
                  "inline-flex items-center justify-center gap-2 h-14 font-black px-6 rounded-2xl transition " +
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 " +
                  (outOfStock
                    ? "bg-[#25D366] hover:bg-[#1ebe5a] text-white"
                    : "border-2 border-[#25D366] text-[#128C4A] hover:bg-[#25D366] hover:text-white")
                }
              >
                <WhatsAppGlyph className="w-5 h-5" />
                {outOfStock ? "Avisarme por WhatsApp" : "Consultar por WhatsApp"}
              </a>
            </div>
          )}

          {atStockLimit && inCartQty > 0 && (
            <p className="mt-3 text-xs font-semibold text-orange-600">
              Ya tienes el máximo disponible ({variant.stock}) en tu carrito.
            </p>
          )}

          {/* El carrito cuenta yardas enteras; quien necesite otra medida
              lo resuelve con el vendedor, que es quien corta la tela. */}
          {buyable && unit.id === "yarda" && (
            <p className="mt-4 text-xs text-slate-500 max-w-md">
              La cantidad se pide en yardas. ¿Necesitas media yarda u otra medida?
              Escríbenos por WhatsApp.
            </p>
          )}

          <p className="mt-4 text-xs text-slate-400">Garantía de 30 días · Entrega 24–48 h</p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display font-semibold text-2xl tracking-tight mb-6">{relatedTitle}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7 lg:[&>*:nth-child(n+4)]:hidden">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                cart={cart}
                onAdd={onAdd}
                onChangeQty={onChangeQty}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductNotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-24 text-center">
      <p className="font-display font-semibold text-2xl text-slate-900">No encontramos ese producto</p>
      <p className="text-slate-500 mt-2">Puede que el enlace esté roto o el producto ya no esté disponible.</p>
      <a href="#" className="inline-block mt-6 bg-brand-primary hover:bg-brand-primary-dark text-white font-black px-6 py-3 rounded-2xl transition">
        Volver al catálogo
      </a>
    </div>
  );
}
