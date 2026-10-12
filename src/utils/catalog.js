/* ==============================================================
   MODELO DEL CATÁLOGO
   Reglas puras (sin React ni red) sobre productos y variantes.
   Están juntas para que la tarjeta, la página del producto, el
   carrito, el mensaje de WhatsApp y el pedido guardado respondan
   lo mismo a "¿cuánto cuesta?", "¿se puede comprar en línea?" y
   "¿cómo se llama este renglón?".

   Un PRODUCTO es lo que el cliente ve (nombre, fotos, descripción).
   Una VARIANTE es lo que se cobra: cada producto tiene al menos una,
   y los que vienen en varias presentaciones (Organza de 60″ o de
   120″) tienen una por presentación, cada cual con su precio.
============================================================== */

/* ---------------- Unidad de venta ---------------- */
const UNITS = {
  // Las telas se venden por yarda; en el carrito la cantidad son yardas.
  yarda: { id: "yarda", per: "por yarda", short: "yd", one: "yarda" },
  unidad: { id: "unidad", per: "", short: "", one: "unidad" },
};
export const unitOf = (product) => UNITS[product?.unit] ?? UNITS.unidad;

/** "3 yd" para telas, "3" para lo que se vende por unidad. */
export const qtyLabel = (product, qty) => {
  const { short } = unitOf(product);
  return short ? `${qty} ${short}` : String(qty);
};

/* ---------------- Variantes ---------------- */
export const hasPrice = (variant) => typeof variant?.price === "number";

/** Agotada: la tienda la marcó como no disponible, o su existencia llegó a 0. */
export const isAvailable = (variant) => variant?.available !== false && variant?.stock !== 0;

/** Una variante se puede elegir en línea si tiene precio y se sabe cuál
    es: o es la única del producto, o trae un rótulo que la distingue. */
export const isSelectable = (product, variant) =>
  hasPrice(variant) && (product.variants.length === 1 || !!variant.label);

/* ---------------- Cómo se vende un producto ----------------
   "consult"  sin precio publicado → se pregunta por WhatsApp
   "single"   un precio            → se agrega al carrito directo
   "options"  varias opciones con rótulo → se elige una y se agrega
   "range"    hay precios, pero no se sabe de qué depende cada uno
              (la tienda mandó dos cifras sin explicación) → se
              muestra el rango y se confirma por WhatsApp          */
export function saleMode(product) {
  const priced = product.variants.filter(hasPrice);
  if (priced.length === 0) return "consult";
  if (priced.some((v) => !isSelectable(product, v))) return "range";
  return product.variants.length === 1 ? "single" : "options";
}

/** Precio más bajo y más alto entre las variantes con precio, o null. */
export function priceRange(product) {
  const prices = product.variants.filter(hasPrice).map((v) => v.price);
  return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null;
}

/** Sin nada que vender ahora mismo: todas las variantes con precio están agotadas. */
export function isSoldOut(product) {
  const priced = product.variants.filter(hasPrice);
  return priced.length > 0 && priced.every((v) => !isAvailable(v));
}

/** Nombre del renglón tal como va al carrito, a WhatsApp y al pedido. */
export const lineName = (product, variant) =>
  variant?.label ? `${product.name} — ${variant.label}` : product.name;

/** id de variante → { product, variant }, para buscar lo que hay en el carrito. */
export function indexVariants(products) {
  const index = new Map();
  for (const product of products) {
    for (const variant of product.variants) index.set(variant.id, { product, variant });
  }
  return index;
}

/* ==============================================================
   CATÁLOGO EN VIVO
   Mezcla lo que trae la página (fotos, textos y el precio del día en
   que se publicó) con lo que dice la base de datos AHORA.

   Reparto:
   - Textos y fotos: los de la página. Cambian junto con el código.
   - Precio, opciones, disponibilidad y unidad: los de la base. Se
     cambian desde el panel sin publicar nada.

   Un producto que la base todavía no conoce (recién agregado al código,
   antes de correr su SQL) queda tal cual. Uno que la base conoce pero
   la página no, se ignora: sin fotos ni descripción no hay qué mostrar.
============================================================== */
export function applyLiveCatalog(bundled, rows) {
  if (!Array.isArray(rows) || rows.length === 0) return bundled;
  const live = new Map(rows.map((r) => [r.id, r]));

  return bundled.flatMap((product) => {
    const row = live.get(product.id);
    if (!row) return [product];
    if (row.active === false) return []; // la tienda lo retiró del catálogo

    const known = row.product_variants ?? [];
    const variants = known
      .filter((v) => v.active !== false)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((v) => ({
        id: v.id,
        label: v.label || null,
        // PostgREST manda numeric como número, pero un null debe seguir
        // siendo null ("a consultar") y no convertirse en 0.
        price: v.price === null || v.price === undefined ? null : Number(v.price),
        available: v.available !== false,
      }));

    /* Tres casos:
       - la base tiene variantes activas → son las que valen;
       - la base no tiene NINGUNA fila para este producto (no se cargó) →
         se conservan las de la página;
       - la base las tiene todas desactivadas → la tienda las quitó a
         propósito: el producto queda "a consultar", sin revivir el precio
         viejo que trae la página. */
    const resolved = variants.length
      ? variants
      : known.length === 0
      ? product.variants
      : [{ id: product.id, label: null, price: null, available: true }];

    return [{ ...product, unit: row.unit ?? product.unit, variants: resolved }];
  });
}
