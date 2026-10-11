import { useState, useCallback, useRef, useMemo } from "react";
import { calcTotals } from "../config/store";
import { hasPrice, isAvailable, isSelectable, indexVariants, lineName } from "../utils/catalog";

const omit = (obj, key) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));

/* ==============================================================
   CARRITO
   Guarda { idDeVariante: cantidad }. La llave es la VARIANTE y no el
   producto porque Organza de 60″ y Organza de 120″ son dos renglones
   con precio distinto. En los productos de una sola presentación la
   variante se llama igual que el producto, así que para ellos nada
   cambia.

   La cantidad va en la unidad de venta: yardas completas para las
   telas, piezas para lo demás.

   Recibe el catálogo vigente (`products`) en vez de importarlo: los
   precios pueden llegar de la base después de la primera pintada, y
   el carrito tiene que cobrar el que esté en pantalla.
============================================================== */
export function useCart(products) {
  const [cart, setCart] = useState({});
  // `lastAdded` alimenta el rebote del contador en el header. Lleva un
  // `key` que sube en cada alta, para que agregar LO MISMO dos veces
  // vuelva a disparar la animación.
  const [lastAdded, setLastAdded] = useState(null);
  const seq = useRef(0);

  const index = useMemo(() => indexVariants(products), [products]);

  // Tope de una variante: su existencia, si la lleva. Las telas del
  // inventario real no la llevan (todavía no se controlan yardas en
  // bodega), así que no tienen tope.
  const clamp = useCallback(
    (id, qty) => Math.max(0, Math.min(qty, index.get(id)?.variant.stock ?? Infinity)),
    [index]
  );

  const addToCart = useCallback((id) => {
    const found = index.get(id);
    // Sin precio, sin rótulo que diga cuál es, o agotada: no entra. La
    // interfaz ya no ofrece el botón en esos casos; esto es el seguro.
    if (!found || !isSelectable(found.product, found.variant) || !isAvailable(found.variant)) return;

    setCart((c) => {
      const cur = c[id] || 0;
      const qty = clamp(id, cur + 1);
      return qty === cur ? c : { ...c, [id]: qty };
    });

    // Solo avisamos si de verdad entró algo: al tope de existencia el
    // clic no suma nada. Se decide contra el estado ya renderizado, que
    // es justo lo que el cliente tenía al frente.
    const cur = cart[id] || 0;
    if (clamp(id, cur + 1) !== cur) {
      setLastAdded({ id, name: lineName(found.product, found.variant), key: ++seq.current });
    }
  }, [cart, index, clamp]);

  const changeQty = (id, delta) =>
    setCart((c) => {
      const qty = clamp(id, (c[id] || 0) + delta);
      return qty <= 0 ? omit(c, id) : { ...c, [id]: qty };
    });

  const removeItem = (id) => setCart((c) => omit(c, id));

  /* Los renglones y los totales viven aquí, no en la gaveta: la barra
     inferior y la gaveta muestran las mismas cifras, y con una sola
     fuente no pueden discrepar. Un renglón cuya variante ya no existe
     o se quedó sin precio se descarta: no hay cómo cobrarlo. */
  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ ...index.get(id), qty }))
        .filter((i) => i.product && hasPrice(i.variant)),
    [cart, index]
  );
  const totals = useMemo(() => calcTotals(items), [items]);

  /* Renglones, no la suma de cantidades: 3 yardas de satín y 2 cajas de
     colorante no son "5 productos". */
  const count = items.length;

  return { cart, addToCart, changeQty, removeItem, count, lastAdded, items, totals };
}
