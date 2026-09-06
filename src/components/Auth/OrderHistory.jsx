import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { money } from "../../config/store";
import { fetchMyOrders, statusLabel } from "../../utils/orders";

/* Colores por estado. Cancelado en gris, no en rojo: no es un error,
   es un final legítimo del pedido. */
const STATUS_STYLE = {
  pending:   "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  paid:      "bg-emerald-100 text-emerald-800",
  delivered: "bg-slate-900 text-white",
  cancelled: "bg-slate-100 text-slate-500",
};

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const r = await fetchMyOrders();
      if (!active) return;
      setLoading(false);
      if (!r.ok) return setError(r.error);
      setOrders(r.orders);
    })();
    return () => { active = false; };
  }, []);

  return (
    <>
      <h2 className="font-display font-semibold text-xl tracking-tight mt-10">
        Mis pedidos
      </h2>

      {loading ? (
        <p className="text-sm text-slate-400 mt-3">Cargando…</p>
      ) : error ? (
        <p className="text-sm text-orange-600 mt-3">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-3 bg-white rounded-3xl shadow-sm px-6 py-8 text-center">
          <Package size={32} strokeWidth={1.5} className="mx-auto text-slate-300" />
          <p className="text-sm text-slate-500 mt-3">
            Todavía no has hecho pedidos. Cuando hagas el primero aparecerá aquí
            con su estado.
          </p>
          <a
            href="#"
            className="inline-block mt-4 text-sm font-bold text-brand-primary hover:underline"
          >
            Ver el catálogo →
          </a>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-3xl shadow-sm px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900 tabular-nums">
                    Pedido #{o.order_number}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(o.created_at).toLocaleDateString("es-PA", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    STATUS_STYLE[o.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel(o.status)}
                </span>
              </div>

              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                {o.order_items?.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4">
                    <span className="min-w-0">
                      <span className="tabular-nums">{i.qty}×</span> {i.product_name}
                    </span>
                    <span className="tabular-nums shrink-0">{money(Number(i.line_total))}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-sm">
                <span className="text-slate-500">
                  {o.city}, {o.province}
                </span>
                <span className="font-black text-slate-900 tabular-nums">
                  {money(Number(o.total))}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
