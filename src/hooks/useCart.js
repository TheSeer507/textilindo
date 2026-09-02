import { useState, useCallback, useRef, useMemo } from "react";
import { PRODUCTS } from "../data/products";
import { calcTotals } from "../config/store";

const clamp = (id, qty) => {
  const product = PRODUCTS.find((p) => p.id === id);
  const max = product ? product.stock : Infinity;
  return Math.max(0, Math.min(qty, max));
};

const omit = (obj, key) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));

export function useCart() {
  const [cart, setCart] = useState({}); // { productId: qty }
  // `lastAdded` alimenta el rebote del contador en el header. Lleva un
  // `key` que sube en cada alta, para que agregar el MISMO producto dos
  // veces vuelva a disparar la animación.
  const [lastAdded, setLastAdded] = useState(null);
  const seq = useRef(0);

  const addToCart = useCallback((id) => {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;

    setCart((c) => {
      const cur = c[id] || 0;
      const qty = clamp(id, cur + 1);
      return qty === cur ? c : { ...c, [id]: qty };
    });

    // Solo avisamos si de verdad entró algo: al tope de stock el clic no
    // suma nada y un toast ahí sería mentira. Se decide contra el estado
    // ya renderizado, que es justo lo que el cliente tenía al frente.
    const cur = cart[id] || 0;
    if (clamp(id, cur + 1) !== cur) {
      setLastAdded({ id, name: product.name, key: ++seq.current });
    }
  }, [cart]);

  const changeQty = (id, delta) =>
    setCart((c) => {
      const qty = clamp(id, (c[id] || 0) + delta);
      return qty <= 0 ? omit(c, id) : { ...c, [id]: qty };
    });

  const removeItem = (id) => setCart((c) => omit(c, id));

  const count = Object.values(cart).reduce((s, q) => s + q, 0);

  /* Los renglones y los totales viven aquí, no en la gaveta: la barra
     inferior y la gaveta muestran las mismas cifras, y con una sola
     fuente no pueden discrepar. */
  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id), qty }))
        .filter((i) => i.product),
    [cart]
  );
  const totals = useMemo(() => calcTotals(items), [items]);

  return { cart, addToCart, changeQty, removeItem, count, lastAdded, items, totals };
}
