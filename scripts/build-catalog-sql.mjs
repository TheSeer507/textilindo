import fs from "node:fs/promises";
import { INVENTORY } from "../src/data/catalog.js";

/* ==============================================================
   CARGA DEL CATÁLOGO A LA BASE  —  npm run catalog:sql

   Lee src/data/catalog.js (los artículos y precios que usa la página)
   y escribe supabase/migrations/0006_catalog_seed.sql, que es lo que
   se pega en Supabase → SQL Editor.

   Existe para que los artículos NO se escriban dos veces a mano, una
   para la página y otra para la base: con 30 filas y precios de por
   medio, tarde o temprano un 3.95 terminaría como 3.59 en un lado.

   QUÉ HACE EL SQL QUE GENERA
   - Artículos: los crea, y si ya existen les actualiza nombre,
     categoría, descripción y orden (esos textos mandan en el código).
   - Precios: los pone SOLO en presentaciones que nunca han tenido
     uno. Nunca pisa un precio que ya esté cargado, y tampoco le
     devuelve el precio a una que alguien dejó "a consultar" desde el
     panel: después de la primera carga los precios se manejan allá, y
     volver a correr este archivo no debe deshacer ese trabajo.
   - Rótulos: solo donde la base no tiene ninguno.
   - No borra nada.

   Por eso es seguro volver a correrlo cada vez que se agrega un
   artículo o llega el precio de uno que estaba "a consultar".
============================================================== */

const OUT = "supabase/migrations/0006_catalog_seed.sql";

/** Texto SQL: comillas simples duplicadas; null si no hay valor. */
const text = (v) => (v === null || v === undefined || v === "" ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const money = (v) => (typeof v === "number" ? v.toFixed(2) : "null");

/* ---- Revisiones antes de escribir nada ----
   Un id repetido haría que una fila pise a otra en silencio. */
const problems = [];
const seenProducts = new Set();
const seenVariants = new Set();
for (const p of INVENTORY) {
  if (seenProducts.has(p.id)) problems.push(`artículo repetido: ${p.id}`);
  seenProducts.add(p.id);
  if (!["yarda", "unidad"].includes(p.unit)) problems.push(`${p.id}: unidad desconocida "${p.unit}"`);
  if (!p.variants.length) problems.push(`${p.id}: no tiene ninguna presentación`);
  for (const v of p.variants) {
    if (seenVariants.has(v.id)) problems.push(`presentación repetida: ${v.id}`);
    seenVariants.add(v.id);
    if (v.price !== null && !(typeof v.price === "number" && v.price >= 0 && Number.isFinite(v.price))) {
      problems.push(`${v.id}: precio inválido (${v.price})`);
    }
  }
}
if (problems.length) {
  console.error("No se generó el SQL. Corrige src/data/catalog.js:\n  " + problems.join("\n  "));
  process.exit(1);
}

const productRows = INVENTORY.map(
  (p, i) => `  (${text(p.id)}, ${text(p.name)}, ${text(p.category)}, ${text(p.desc)}, ${text(p.unit)}, ${(i + 1) * 10})`
);

const variantRows = INVENTORY.flatMap((p) =>
  p.variants.map(
    (v, i) => `  (${text(v.id)}, ${text(p.id)}, ${text(v.label)}, ${money(v.price)}, ${text(v.note)}, ${(i + 1) * 10})`
  )
);

const priced = INVENTORY.flatMap((p) => p.variants).filter((v) => typeof v.price === "number").length;

const sql = `-- ============================================================
-- 0006 — CARGA DEL CATÁLOGO
-- ARCHIVO GENERADO: no editar a mano. Sale de src/data/catalog.js
-- con \`npm run catalog:sql\`.
--
-- Pegar completo en Supabase → SQL Editor → Run (después de 0005).
-- Se puede volver a correr las veces que haga falta:
--   · crea los artículos que falten y refresca sus textos;
--   · pone precio SOLO a lo que nunca ha tenido uno: no pisa un precio
--     ya cargado ni se lo devuelve a algo que se dejó "a consultar";
--   · no borra nada.
--
-- ${INVENTORY.length} artículos · ${variantRows.length} presentaciones · ${priced} con precio
-- ============================================================

insert into public.products (id, name, category, description, unit, sort_order) values
${productRows.join(",\n")}
on conflict (id) do update set
  name        = excluded.name,
  category    = excluded.category,
  description = excluded.description,
  sort_order  = excluded.sort_order;
  -- \`unit\` y \`active\` no se tocan si el artículo ya existe: esos los decide la base.

insert into public.product_variants as v (id, product_id, label, price, note, sort_order) values
${variantRows.join(",\n")}
on conflict (id) do update set
  sort_order = excluded.sort_order,
  label      = coalesce(v.label, excluded.label),
  -- El precio entra solo si esta presentación NUNCA ha tenido uno (sin
  -- precio hoy y sin filas en el historial). Un precio que alguien quitó
  -- desde el panel es una decisión de la tienda y aquí no se revierte.
  price      = case when v.price is null
                     and not exists (select 1 from public.price_history h where h.variant_id = v.id)
                    then excluded.price else v.price end,
  -- La nota dice de dónde salió el precio: entra solo junto con él.
  note       = case when v.price is null
                     and not exists (select 1 from public.price_history h where h.variant_id = v.id)
                    then excluded.note else v.note end;
`;

await fs.writeFile(OUT, sql);
console.log(`${OUT}\n  ${INVENTORY.length} artículos · ${variantRows.length} presentaciones · ${priced} con precio`);
