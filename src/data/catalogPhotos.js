/* ==============================================================
   FOTOS DEL CATÁLOGO
   Cada producto tiene su carpeta en src/assets/catalogo/<id>/,
   generada por `npm run catalog:photos`:

     <id>-01.webp, <id>-02.webp …  galería, en orden (la primera es la principal)
     <id>-01.mini.webp …           miniaturas para la tira de la galería
     <id>-thumb.webp               portada cuadrada para la tarjeta y el carrito

   Vite las recoge todas en tiempo de compilación, así que agregar
   una foto a una carpeta NO requiere tocar ningún import: el
   producto cuyo `id` coincide con la carpeta la recibe sola.
============================================================== */
const files = import.meta.glob("../assets/catalogo/*/*.webp", { eager: true, import: "default" });

const byProduct = {};
for (const [file, url] of Object.entries(files)) {
  const [, id, base] = file.match(/catalogo\/([^/]+)\/(.+)\.webp$/);
  const name = base.startsWith(`${id}-`) ? base.slice(id.length + 1) : base; // "01", "01.mini", "thumb"
  const entry = (byProduct[id] ??= { thumb: null, full: {}, mini: {} });
  if (name === "thumb") entry.thumb = url;
  else if (name.endsWith(".mini")) entry.mini[name.replace(".mini", "")] = url;
  else entry.full[name] = url;
}

/** Fotos de un producto, listas para esparcir dentro de su ficha. */
export function photos(id) {
  const entry = byProduct[id];
  if (!entry) {
    // Un id mal escrito dejaría la tarjeta sin foto y sin aviso.
    if (import.meta.env.DEV) console.warn(`[catálogo] no hay fotos en src/assets/catalogo/${id}/`);
    return { images: [], minis: [], thumb: null };
  }
  const order = Object.keys(entry.full).sort();
  return {
    images: order.map((n) => entry.full[n]),
    minis: order.map((n) => entry.mini[n] ?? entry.full[n]),
    thumb: entry.thumb,
  };
}
