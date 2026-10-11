import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { money, round2 } from "../../config/store";

const UNIT_LABEL = { yarda: "por yarda", unidad: "por unidad" };

/* ==============================================================
   CATÁLOGO Y PRECIOS  (panel)
   Lo que hay en la base: cada artículo, sus presentaciones y el
   precio de cada una. Es la lista que la tienda usa para cobrar: la
   página le pone estos precios encima a lo que trae empaquetado.

   Un admin puede cambiar un precio (o dejarlo vacío = "a consultar")
   y marcar una presentación como agotada. El cambio queda en la base
   al salir de la casilla y la tienda lo muestra a quien cargue la
   página desde ese momento, sin publicar nada.

   Quién puede escribir lo decide RLS (política "admin administra
   precios"), no esta pantalla: a un empleado la base le rechazaría
   el cambio aunque viera las casillas, así que ni se le dibujan.
============================================================== */
export function CatalogTable({ isAdmin }) {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const [catalog, changes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, category, unit, active, sort_order, product_variants(id, label, price, available, active, note, updated_at, sort_order)")
          .order("sort_order")
          .order("sort_order", { referencedTable: "product_variants" }),
        supabase
          .from("price_history")
          .select("id, variant_id, old_price, new_price, changed_at, product_variants(label, products(name)), profiles(full_name, email)")
          .order("changed_at", { ascending: false })
          .limit(8),
      ]);
      if (!active) return;
      setLoading(false);

      if (catalog.error) {
        // Tabla inexistente: todavía no se corrieron las migraciones.
        const notCreated = catalog.error.code === "PGRST205" || catalog.error.code === "42P01";
        setMissing(notCreated);
        setError(notCreated ? "" : catalog.error.message);
        return;
      }
      setMissing(false);
      setError("");
      setProducts(catalog.data ?? []);
      setHistory(changes.data ?? []);
    })();
    return () => { active = false; };
  }, [reloadKey]);

  const refresh = () => { setLoading(true); setReloadKey((k) => k + 1); };

  /* Guarda un cambio en una presentación. Optimista: la tabla lo muestra
     de una vez y, si la base lo rechaza, vuelve a como estaba. */
  const patchVariant = async (variantId, patch) => {
    const previous = products;
    setProducts((list) =>
      list.map((p) => ({
        ...p,
        product_variants: p.product_variants.map((v) => (v.id === variantId ? { ...v, ...patch } : v)),
      }))
    );
    const { error } = await supabase.from("product_variants").update(patch).eq("id", variantId);
    if (error) {
      setProducts(previous);
      setError("No se pudo guardar: " + error.message);
      return false;
    }
    setError("");
    if ("price" in patch) setReloadKey((k) => k + 1); // refresca el historial
    return true;
  };

  const variants = products.flatMap((p) => p.product_variants.filter((v) => v.active !== false));
  const priced = variants.filter((v) => v.price !== null).length;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-black text-2xl">Catálogo y precios</h2>
        <button onClick={refresh} className="text-xs font-bold text-amber-400 hover:underline">
          Actualizar
        </button>
      </div>

      {missing ? (
        <p className="mt-4 text-sm text-amber-200 bg-amber-950/40 border border-amber-900 rounded-xl px-4 py-3 leading-relaxed">
          Todavía no existen las tablas del catálogo. Corre en Supabase → SQL Editor los
          archivos <strong>0005_catalog.sql</strong> y luego <strong>0006_catalog_seed.sql</strong>{" "}
          (carpeta supabase/migrations). Mientras tanto la tienda muestra los precios
          que trae la página.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-2xl">
            {isAdmin
              ? "Escribe el precio y sal de la casilla para guardarlo. Vacío = “Precio a consultar”. La tienda muestra el cambio a quien cargue la página desde ese momento."
              : "Estos son los precios que muestra la tienda. Solo un administrador puede cambiarlos."}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-5 max-w-xl">
            <Stat label="Artículos" value={products.length} />
            <Stat label="Con precio" value={priced} accent />
            <Stat label="A consultar" value={variants.length - priced} warn={variants.length - priced > 0} />
          </div>

          {error && (
            <p className="mt-4 text-sm font-bold text-orange-400 bg-orange-950/40 border border-orange-900 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {loading && products.length === 0 ? (
            <p className="text-slate-500 mt-6 text-sm">Cargando catálogo…</p>
          ) : (
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700">
              <table className="w-full text-sm min-w-[44rem]">
                <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="text-left px-4 py-3">Artículo</th>
                    <th className="text-left px-4 py-3">Categoría</th>
                    <th className="text-left px-4 py-3">Precio</th>
                    <th className="text-left px-4 py-3">Disponible</th>
                  </tr>
                </thead>
                <tbody>
                  {products.flatMap((p) =>
                    p.product_variants
                      .filter((v) => v.active !== false)
                      .map((v) => (
                        <tr key={v.id} className={"border-t border-slate-800 " + (p.active === false ? "opacity-50" : "")}>
                          <td className="px-4 py-3">
                            <span className="font-bold">{p.name}</span>
                            {v.label && <span className="text-amber-300"> — {v.label}</span>}
                            {/* Varias filas sin rótulo: la tienda dio varios precios
                                sin decir de qué depende cada uno. */}
                            {!v.label && p.product_variants.length > 1 && (
                              <span className="ml-2 text-xs text-orange-400" title="La tienda mostrará el rango de precios y mandará a WhatsApp hasta que cada precio tenga rótulo.">
                                (sin rótulo)
                              </span>
                            )}
                            {p.active === false && <span className="ml-2 text-xs text-slate-400">(retirado)</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-400">{p.category}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {isAdmin ? (
                              <PriceCell
                                // La llave incluye el precio: si cambia por fuera
                                // (o se revierte un guardado fallido), la casilla
                                // vuelve a mostrar lo que dice la base.
                                key={`${v.id}:${v.price}`}
                                price={v.price}
                                label={`${p.name}${v.label ? " — " + v.label : ""}`}
                                onSave={(price) => patchVariant(v.id, { price })}
                              />
                            ) : v.price === null ? (
                              <span className="text-slate-500">a consultar</span>
                            ) : (
                              <span className="font-bold tabular-nums">{money(Number(v.price))}</span>
                            )}
                            <span className="ml-2 text-xs text-slate-500">{UNIT_LABEL[p.unit] ?? ""}</span>
                          </td>
                          <td className="px-4 py-3">
                            {isAdmin ? (
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={v.available !== false}
                                  onChange={(e) => patchVariant(v.id, { available: e.target.checked })}
                                  className="w-4 h-4 accent-amber-400"
                                />
                                <span className={v.available === false ? "text-orange-400 font-bold" : "text-slate-400"}>
                                  {v.available === false ? "Agotada" : "Sí"}
                                </span>
                              </label>
                            ) : (
                              <span className={v.available === false ? "text-orange-400 font-bold" : "text-slate-400"}>
                                {v.available === false ? "Agotada" : "Sí"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-slate-400">Últimos cambios de precio</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {history.map((h) => {
                  const name =
                    (h.product_variants?.products?.name ?? h.variant_id) +
                    (h.product_variants?.label ? ` — ${h.product_variants.label}` : "");
                  const fmt = (n) => (n === null ? "a consultar" : money(Number(n)));
                  return (
                    <li key={h.id} className="flex flex-wrap gap-x-2">
                      <span className="text-slate-500 tabular-nums">
                        {new Date(h.changed_at).toLocaleDateString("es-PA", { day: "2-digit", month: "short" })}
                      </span>
                      <span className="text-slate-200">{name}:</span>
                      <span className="tabular-nums">
                        {h.old_price === null && h.new_price !== null
                          ? `precio inicial ${fmt(h.new_price)}`
                          : `${fmt(h.old_price)} → ${fmt(h.new_price)}`}
                      </span>
                      <span className="text-slate-500">
                        · {h.profiles?.full_name || h.profiles?.email || "carga inicial / SQL"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* Casilla de precio. Guarda al salir o con Enter; Escape la deja como
   estaba. Acepta coma o punto decimal, que en el teclado numérico de
   un teléfono en español suele ser coma. */
function PriceCell({ price, label, onSave }) {
  const shown = price === null ? "" : Number(price).toFixed(2);
  const [draft, setDraft] = useState(shown);
  const [bad, setBad] = useState(false);

  const commit = async () => {
    const raw = draft.trim().replace(",", ".");
    if (raw === shown) { setBad(false); return; }
    if (raw === "") { setBad(false); await onSave(null); return; }
    const value = Number(raw);
    if (!/^\d+(\.\d{1,2})?$/.test(raw) || !Number.isFinite(value)) { setBad(true); return; }
    setBad(false);
    await onSave(round2(value));
  };

  return (
    <span className="inline-flex items-center">
      <span className="text-slate-500 mr-1">$</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setDraft(shown); setBad(false); }
        }}
        inputMode="decimal"
        placeholder="a consultar"
        aria-label={`Precio de ${label}`}
        aria-invalid={bad}
        title={bad ? "Escribe un monto como 3.95" : undefined}
        className={
          "w-28 bg-slate-900 border rounded-lg px-2 py-1.5 text-sm text-white tabular-nums focus:outline-none " +
          (bad ? "border-orange-500 focus:border-orange-400" : "border-slate-600 focus:border-amber-400")
        }
      />
    </span>
  );
}

function Stat({ label, value, accent, warn }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className={"font-black text-2xl mt-1 tabular-nums " + (accent ? "text-amber-400" : warn ? "text-orange-400" : "text-white")}>
        {value}
      </p>
    </div>
  );
}
