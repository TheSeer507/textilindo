import { INVENTORY } from "./catalog";
import { photos } from "./catalogPhotos";

/* ==============================================================
   CATÁLOGO QUE TRAE LA PÁGINA
   Es el inventario de la tienda (src/data/catalog.js: ahí se agregan
   productos y se escriben los precios) con sus fotos pegadas. Las
   fotos se enlazan solas por `id` desde src/assets/catalogo/<id>/.

   Aquí no se escribe ningún producto a mano: todo lo que sale en la
   tienda tiene sus fotos de catálogo y su fila en la base de datos.

   Todo producto sale de aquí con la misma forma:
     { id, name, category, desc, unit, variants: [{ id, label, price }],
       images, minis, thumb }
   Lo que se vende es siempre una variante (ver src/utils/catalog.js).

   Este es el catálogo "de fábrica": la página arranca con él y, en
   cuanto la base responde, le pone encima los precios y la
   disponibilidad del momento (src/hooks/useCatalog.js).
============================================================== */
const ALL = INVENTORY.map((product) => ({ ...product, ...photos(product.id) }));

/* Se agrupa por categoría, en el orden en que cada una aparece por
   primera vez: así un producto agregado al final del archivo queda
   junto a los de su categoría y no suelto al final de la tienda.
   (sort es estable: dentro de cada categoría se respeta el orden en
   que están escritos.) */
const categoryOrder = [...new Set(ALL.map((p) => p.category))];
export const PRODUCTS = [...ALL].sort(
  (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
);

/** Categorías de una lista de productos, en orden de aparición, con "Todos" al frente. */
export const categoriesOf = (products) => ["Todos", ...new Set(products.map((p) => p.category))];

/* Con esta existencia o menos, la tienda avisa "¡Quedan N!". Solo aplica
   a variantes que lleven `stock`; hoy ninguna lo lleva, porque la tienda
   todavía no cuenta existencias. */
export const LOW_STOCK_THRESHOLD = 5;
