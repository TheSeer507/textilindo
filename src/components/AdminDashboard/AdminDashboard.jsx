import { useState } from "react";
import { CONFIG, money } from "../../config/store";
import { PRODUCTS } from "../../data/products";
import { OrdersTable } from "./OrdersTable";
import { UsersTable } from "./UsersTable";

/* ==============================================================
   ADMIN — margins for the whole catalog (#admin)

   Ya no es una ruta abierta: CatalogStore solo monta este panel
   cuando hay sesión con rol employee o admin. Aun así, el muro
   de verdad son las políticas RLS — esconder la ruta no protege
   los datos, las políticas sí.
============================================================== */
export function AdminDashboard({ profile, isAdmin, onSignOut }) {
  const [fixed, setFixed] = useState(300);

  const rows = PRODUCTS.map((p) => {
    const freight = p.weightKg * p.shipPerKg;
    const dutiable = p.cost + freight;
    const duties = dutiable * (p.tariffPct / 100);
    const landed = dutiable + duties + CONFIG.shippingFlat; // last-mile approximated by your flat rate
    const profit = p.price - landed;
    const margin = (profit / p.price) * 100;
    return { ...p, landed, profit, margin };
  }).sort((a, b) => b.profit - a.profit);

  const best = rows[0];
  const breakEven = best.profit > 0 ? Math.ceil(fixed / best.profit) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-mono">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-amber-400 text-xs uppercase" style={{ letterSpacing: "0.3em" }}>{CONFIG.storeName} · Operaciones</p>
            <h1 className="font-black text-3xl mt-1">Rentabilidad del catálogo</h1>
            <p className="text-xs text-slate-500 mt-2">
              {profile?.full_name || profile?.email} ·{" "}
              <span className="text-amber-400">{isAdmin ? "Administrador" : "Empleado"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="text-sm border border-slate-600 rounded-xl px-4 py-2 hover:bg-slate-800">← Volver a la tienda</a>
            <button onClick={onSignOut} className="text-sm border border-slate-600 rounded-xl px-4 py-2 hover:bg-slate-800">
              Salir
            </button>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Producto</th>
                <th className="text-right px-4 py-3">Precio</th>
                <th className="text-right px-4 py-3">Costo landed</th>
                <th className="text-right px-4 py-3">Ganancia</th>
                <th className="text-right px-4 py-3">Margen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">{r.emoji} {r.name}</td>
                  <td className="text-right px-4 py-3">{money(r.price)}</td>
                  <td className="text-right px-4 py-3 text-slate-400">{money(r.landed)}</td>
                  <td className={"text-right px-4 py-3 font-bold " + (r.profit > 0 ? "text-green-400" : "text-orange-500")}>{money(r.profit)}</td>
                  <td className={"text-right px-4 py-3 " + (r.margin >= 30 ? "text-green-400" : r.margin > 0 ? "text-amber-300" : "text-orange-500")}>
                    {r.margin.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-5">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <label className="text-xs uppercase tracking-widest text-slate-400 block mb-2">Costos fijos mensuales (ads + herramientas)</label>
            <input
              type="number" value={fixed} onChange={(e) => setFixed(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-slate-400">Punto de equilibrio (con tu mejor producto)</p>
            <p className="font-black text-3xl mt-2 text-amber-400">{breakEven === null ? "∞" : breakEven + " uds/mes"}</p>
            <p className="text-xs text-slate-500 mt-1">vendiendo {best.emoji} {best.name}</p>
          </div>
        </div>

        <OrdersTable />

        <UsersTable isAdmin={isAdmin} currentUserId={profile?.id} />

        <p className="mt-10 text-xs text-slate-500">
          Los costos por producto se editan en el arreglo PRODUCTS del código (cost, weightKg, shipPerKg, tariffPct).
        </p>
      </div>
    </div>
  );
}
