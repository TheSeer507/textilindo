import { useEffect } from "react";
import { money, CONFIG } from "../../config/store";
import { PRODUCTS, LOW_STOCK_THRESHOLD } from "../../data/products";
import { ImageGallery } from "../ImageGallery/ImageGallery";
import { ProductCard } from "../ProductCard/ProductCard";
import { WhatsAppGlyph } from "../icons/WhatsAppGlyph";
import { buildChatLink } from "../../utils/whatsapp";

export function ProductPage({ product, cart, onAdd }) {
  useEffect(() => {
    document.title = `${product.name} — ${CONFIG.storeName}`;
    return () => { document.title = CONFIG.storeName; };
  }, [product]);

  const inCartQty = cart[product.id] || 0;
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  const atStockLimit = inCartQty >= product.stock;

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <a href="#" className="text-sm font-semibold text-slate-500 hover:text-brand-primary">
        ← Volver al catálogo
      </a>

      <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-6">
        {product.images?.length ? (
          <ImageGallery images={product.images} alt={product.name} />
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
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-black text-3xl text-slate-900">{money(product.price)}</span>
            <span className="line-through text-lg text-slate-400">{money(product.compareAt)}</span>
          </div>

          {outOfStock ? (
            <p className="text-sm font-semibold text-slate-500 mt-3">Agotado por ahora</p>
          ) : lowStock ? (
            <p className="text-sm font-semibold text-orange-600 mt-3">¡Quedan {product.stock}!</p>
          ) : null}

          <p className="text-slate-600 mt-5 leading-relaxed max-w-md">{product.desc}</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAdd(product.id)}
              disabled={outOfStock || atStockLimit}
              className={
                "font-black py-4 px-8 rounded-2xl transition " +
                (outOfStock || atStockLimit
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-brand-accent hover:bg-brand-accent-dark text-brand-primary")
              }
            >
              {outOfStock
                ? "Agotado"
                : atStockLimit
                ? `Máximo disponible (${product.stock})`
                : "Agregar al carrito"}
            </button>

            {/* Cuando el producto está agotado, consultar es la única acción
                útil que queda — así que ahí se vuelve el botón principal. */}
            <a
              href={buildChatLink({ productName: product.name, outOfStock })}
              target="_blank"
              rel="noreferrer"
              className={
                "inline-flex items-center justify-center gap-2 font-black py-4 px-6 rounded-2xl transition " +
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

          <p className="mt-4 text-xs text-slate-400">Garantía de 30 días · Entrega 24–48 h</p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display font-semibold text-2xl tracking-tight mb-6">Más de {product.category}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} inCartQty={cart[p.id] || 0} onAdd={onAdd} />
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
