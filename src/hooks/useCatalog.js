import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { PRODUCTS } from "../data/products";
import { applyLiveCatalog } from "../utils/catalog";

/* ==============================================================
   CATÁLOGO VIGENTE
   La página arranca con el catálogo que trae empaquetado (se pinta
   al instante, sin esperar a nadie) y le pide a la base los precios
   y la disponibilidad del momento. Cuando llegan, se ponen encima.

   Si la base no responde —sin internet, proyecto en pausa, o las
   tablas aún sin crear— no pasa nada: la tienda sigue funcionando
   con los precios del día en que se publicó. Es preferible eso a
   una tienda vacía.

   Lo que se pide es poco a propósito: solo lo que la base decide
   (unidad, si está activo, y las variantes con su precio). Los
   textos y las fotos son los de la página.
============================================================== */
const LIVE_FIELDS =
  "id, unit, active, product_variants(id, label, price, available, active, sort_order)";

export function useCatalog() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from("products").select(LIVE_FIELDS);
      if (!active) return;
      if (error) {
        console.info("[catálogo] la base no respondió; se muestran los precios de respaldo.", error.message);
        return;
      }
      setRows(data ?? []);
    })();
    return () => { active = false; };
  }, []);

  const products = useMemo(() => (rows ? applyLiveCatalog(PRODUCTS, rows) : PRODUCTS), [rows]);

  return { products, live: rows !== null };
}
