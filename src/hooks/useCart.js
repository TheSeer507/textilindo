import { useState } from "react";
import { PRODUCTS } from "../data/products";

const clamp = (id, qty) => {
  const product = PRODUCTS.find((p) => p.id === id);
  const max = product ? product.stock : Infinity;
  return Math.max(0, Math.min(qty, max));
};

const omit = (obj, key) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));

export function useCart() {
  const [cart, setCart] = useState({}); // { productId: qty }

  const addToCart = (id) =>
    setCart((c) => {
      const qty = clamp(id, (c[id] || 0) + 1);
      return qty === (c[id] || 0) ? c : { ...c, [id]: qty };
    });

  const changeQty = (id, delta) =>
    setCart((c) => {
      const qty = clamp(id, (c[id] || 0) + delta);
      return qty <= 0 ? omit(c, id) : { ...c, [id]: qty };
    });

  const removeItem = (id) => setCart((c) => omit(c, id));

  const count = Object.values(cart).reduce((s, q) => s + q, 0);

  return { cart, addToCart, changeQty, removeItem, count };
}
