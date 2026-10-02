import { useEffect } from "react";
import { money, CONFIG } from "../../config/store";
import { PRODUCTS, LOW_STOCK_THRESHOLD, hasPrice } from "../../data/products";
import { ImageGallery } from "../ImageGallery/ImageGallery";
import { ProductCard } from "../ProductCard/ProductCard";
import { WhatsAppGlyph } from "../icons/WhatsAppGlyph";
import { QuantityStepper } from "../QuantityStepper/QuantityStepper";
import { buildChatLink } from "../../utils/whatsapp";

export function ProductPage({ product, cart, onAdd, onChangeQty, onRemove }) {
  useEffect(() => {
    document.title = `${product.name} — ${CONFIG.storeName}`;
    return () => { document.title = CONFIG.storeName; };
  }, [product]);

  const inCartQty = cart[product.id] || 0;
  const priced = hasPrice(product);
  const onSale = priced && product.compareAt > product.price;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const atStockLimit = inCartQty >= product.stock;

  /* Varias categorías tienen un solo producto (Organza, Tull, Encaje…),
     y ahí "Más de la categoría" quedaba vacío y la página terminaba en
     seco. Se completa con los productos que siguen en el catálogo, para
     que siempre haya a dónde seguir mirando. Sin azar: el mismo producto
     muestra siempre las mismas sugerencias. */
  const at = PRODUCTS.findIndex((p) => p.id === product.id);
  const following = [...PRODUCTS.slice(at + 1), ...PRODUCTS.slice(0, at)];
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
          // producto a otro, y venir de la foto 6 de Algodón a un producto con
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
          {priced ? (
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-black text-3xl text-slate-900">{money(product.price)}</span>
              {onSale && <span className="line-through text-lg text-slate-400">{money(product.compareAt)}</span>}
            </div>
          ) : (
            <div className="mt-4">
              <p className="font-black text-2xl text-slate-900">Precio a consultar</p>
              <p className="text-sm text-slate-500 mt-1">
                Te lo damos al momento por WhatsApp, junto con los colores disponibles.
              </p>
            </div>
          )}

          {outOfStock ? (
            <p className="text-sm font-semibold text-slate-500 mt-3">Agotado por ahora</p>
          ) : lowStock ? (
            <p className="text-sm font-semibold text-orange-600 mt-3">¡Quedan {product.stock}!</p>
          ) : null}

          <p className="text-slate-600 mt-5 leading-relaxed max-w-md">{product.desc}</p>

          {/* Sin precio publicado no hay carrito: la única acción es
              preguntar, así que WhatsApp pasa a ser el botón principal. */}
          {!priced ? (
            <div className="mt-8">
              <a
                href={buildChatLink({ productName: product.name, askPrice: true })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-14 font-black px-8 rounded-2xl transition bg-[#0F7A40] hover:bg-[#0c6635] text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
              >
                <WhatsAppGlyph className="w-5 h-5" />
                Consultar precio por WhatsApp
              </a>
            </div>
          ) : (
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {/* Igual que en la tarjeta: una vez que hay unidades, el botón
                cede su lugar al control de cantidad. */}
            {inCartQty > 0 && !outOfStock ? (
              <div className="sm:w-64">
                <QuantityStepper
                  product={product}
                  qty={inCartQty}
                  onAdd={onAdd}
                  onChangeQty={onChangeQty}
                  onRemove={onRemove}
                  size="lg"
                />
              </div>
            ) : (
              <button
                onClick={() => onAdd(product.id)}
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

            {/* Cuando el producto está agotado, consultar es la única acción
                útil que queda — así que ahí se vuelve el botón principal. */}
            <a
              href={buildChatLink({ productName: product.name, outOfStock })}
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
              Ya tienes el máximo disponible ({product.stock}) en tu carrito.
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
                inCartQty={cart[p.id] || 0}
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
