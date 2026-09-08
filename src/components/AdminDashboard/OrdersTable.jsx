import { useState, useEffect, Fragment } from "react";
import { supabase } from "../../lib/supabaseClient";
import { money } from "../../config/store";
import { formatPanamaPhone } from "../../utils/phone";
import { ORDER_STATUS } from "../../utils/orders";

/* ==============================================================
   PEDIDOS  (panel)
   La lista operativa: quién pidió qué, y en qué va.

   El estado es lo que convierte la tabla en un registro de ventas
   real — las vistas de ingresos excluyen 'cancelled', así que
   marcar bien aquí es lo que hace que los números de arriba sean
   ciertos.
============================================================== */
export function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), profiles(full_name, email, company_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!active) return;
      setLoading(false);
      if (error) return setError(error.message);
      setError("");
      setOrders(data ?? []);
    })();
    return () => { active = false; };
  }, [reloadKey]);

  const changeStatus = async (id, status) => {
    const previous = orders;
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      setOrders(previous); // RLS lo rechazó: volver a como estaba
      setError("No se pudo cambiar el estado: " + error.message);
    }
  };

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  // Los cancelados no son venta: no entran en el total.
  const live = orders.filter((o) => o.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const toVerify = orders.filter(
    (o) => o.status === "pending" && o.payment_ref?.startsWith("reportado:")
  ).length;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-black text-2xl">Pedidos</h2>
        <button
          onClick={() => { setLoading(true); setReloadKey((k) => k + 1); }}
          className="text-xs font-bold text-amber-400 hover:underline"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <Stat label="Pedidos" value={live.length} />
        <Stat label="Ingresos" value={money(revenue)} accent />
        <Stat label="Ticket promedio" value={live.length ? money(revenue / live.length) : "—"} />
        <Stat
          label={toVerify > 0 ? "Verificar pago" : "Pendientes"}
          value={toVerify > 0 ? toVerify : pending}
          warn={pending > 0 || toVerify > 0}
        />
      </div>

      {error && (
        <p className="mt-4 text-sm font-bold text-orange-400 bg-orange-950/40 border border-orange-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-6">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          Todos ({orders.length})
        </Chip>
        {ORDER_STATUS.map((s) => {
          const n = orders.filter((o) => o.status === s.id).length;
          return (
            <Chip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} title={s.hint}>
              {s.label} ({n})
            </Chip>
          );
        })}
      </div>

      {loading ? (
        <p className="text-slate-500 mt-6 text-sm">Cargando pedidos…</p>
      ) : shown.length === 0 ? (
        <p className="text-slate-500 mt-6 text-sm">
          {orders.length === 0
            ? "Todavía no hay pedidos. El primero aparecerá aquí apenas alguien confirme por WhatsApp."
            : "Ningún pedido con ese estado."}
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-sm min-w-[52rem]">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Entrega</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <Fragment key={o.id}>
                  <tr
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="border-t border-slate-800 cursor-pointer hover:bg-slate-800/50"
                    title="Ver los productos del pedido"
                  >
                    <td className="px-4 py-3 font-black tabular-nums">
                      #{o.order_number}
                      {/* Pago que el cliente reportó pero que nadie confirmó
                          contra PagueloFacil. No es venta hasta cotejarlo. */}
                      {o.status === "pending" && o.payment_ref?.startsWith("reportado:") && (
                        <span
                          title={"Cotejar en PagueloFacil: " + o.payment_ref.replace("reportado:", "")}
                          className="block mt-1 text-[10px] font-bold text-amber-400 normal-case"
                        >
                          verificar pago
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString("es-PA", {
                        day: "2-digit", month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-semibold">
                        {o.profiles?.full_name || o.guest_name || "—"}
                        {!o.customer_id && (
                          <span className="ml-2 text-xs text-slate-500">(invitado)</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {o.guest_phone ? `+507 ${formatPanamaPhone(o.guest_phone)}` : ""}
                        {o.profiles?.company_name ? ` · ${o.profiles.company_name}` : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {o.city}, {o.province}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      {money(Number(o.total))}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o.id, e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      >
                        {ORDER_STATUS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {expanded === o.id && (
                    <tr className="bg-slate-950/60">
                      <td colSpan={6} className="px-4 py-4">
                        <ul className="space-y-1 text-slate-300">
                          {o.order_items?.map((i) => (
                            <li key={i.id} className="flex justify-between max-w-md">
                              <span>{i.qty}× {i.product_name}</span>
                              <span className="tabular-nums">{money(Number(i.line_total))}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 pt-3 border-t border-slate-800 max-w-md text-xs text-slate-400 space-y-0.5">
                          <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{money(Number(o.subtotal))}</span></div>
                          <div className="flex justify-between"><span>Envío</span><span className="tabular-nums">{money(Number(o.shipping))}</span></div>
                          <div className="flex justify-between"><span>ITBMS</span><span className="tabular-nums">{money(Number(o.tax))}</span></div>
                          <div className="flex justify-between text-white font-bold pt-1"><span>Total</span><span className="tabular-nums">{money(Number(o.total))}</span></div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">
                          Pago: {o.payment_method}
                          {o.notes ? ` · Notas: ${o.notes}` : ""}
                        </p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, accent, warn }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
      <p className={
        "font-black text-2xl mt-1 tabular-nums " +
        (accent ? "text-amber-400" : warn ? "text-orange-400" : "text-white")
      }>
        {value}
      </p>
    </div>
  );
}

function Chip({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={
        "text-xs font-bold px-3 py-1.5 rounded-full border transition-colors " +
        (active
          ? "bg-amber-400 text-slate-900 border-amber-400"
          : "border-slate-700 text-slate-400 hover:border-slate-500")
      }
    >
      {children}
    </button>
  );
}
