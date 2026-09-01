import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { formatPanamaPhone } from "../../utils/phone";

const ROLES = [
  { id: "customer", label: "Cliente" },
  { id: "employee", label: "Empleado" },
  { id: "admin", label: "Administrador" },
];

/* ==============================================================
   USUARIOS REGISTRADOS
   Lo que devuelve esta consulta lo decide RLS, no el frontend:
   is_staff() deja ver todos los perfiles, y a un cliente normal
   la misma consulta solo le devolvería el suyo.

   Cambiar roles queda restringido a admin (política
   "admin edita cualquier perfil"); si un empleado lo intenta, la
   base lo rechaza aunque el <select> aparezca en pantalla.
============================================================== */
export function UsersTable({ isAdmin, currentUserId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // La carga vive dentro del efecto (no en una función que el efecto
  // llame): así los setState ocurren en el callback async y no en el
  // cuerpo síncrono, que es lo que provocaría renders en cascada.
  // `reloadKey` es lo que vuelve a dispararlo desde "Actualizar".
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, company_name, role, created_at")
        .order("created_at", { ascending: false });
      if (!active) return;
      setLoading(false);
      if (error) return setError(error.message);
      setError("");
      setRows(data ?? []);
    })();
    return () => { active = false; };
  }, [reloadKey]);

  const refresh = () => { setLoading(true); setReloadKey((k) => k + 1); };

  const changeRole = async (id, role) => {
    const previous = rows;
    setRows((r) => r.map((u) => (u.id === id ? { ...u, role } : u))); // optimista
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      setRows(previous); // RLS lo bloqueó: devolvemos la tabla a como estaba
      setError("No se pudo cambiar el rol: " + error.message);
    }
  };

  const staffCount = rows.filter((u) => u.role !== "customer").length;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-black text-2xl">Usuarios registrados</h2>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span><strong className="text-white">{rows.length}</strong> en total</span>
          <span><strong className="text-white">{staffCount}</strong> con acceso interno</span>
          <button onClick={refresh} className="font-bold text-amber-400 hover:underline">
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm font-bold text-orange-400 bg-orange-950/40 border border-orange-900 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500 mt-6 text-sm">Cargando usuarios…</p>
      ) : rows.length === 0 ? (
        <p className="text-slate-500 mt-6 text-sm">
          Todavía no hay nadie registrado. En cuanto alguien cree su cuenta aparecerá aquí.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-sm min-w-[48rem]">
            <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Correo</th>
                <th className="text-left px-4 py-3">Teléfono</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Registro</th>
                <th className="text-left px-4 py-3">Rol</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-slate-800">
                  <td className="px-4 py-3 font-bold">
                    {u.full_name || "—"}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-xs font-bold text-amber-400">(tú)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 tabular-nums">
                    {u.phone ? `+507 ${formatPanamaPhone(u.phone)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.company_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 tabular-nums">
                    {new Date(u.created_at).toLocaleDateString("es-PA", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? "No puedes cambiar tu propio rol" : undefined}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400 disabled:text-slate-500 disabled:border-slate-800"
                      >
                        {ROLES.map((r) => (
                          <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={u.role} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isAdmin && (
        <p className="mt-3 text-xs text-slate-500">
          Solo un administrador puede cambiar roles.
        </p>
      )}
    </section>
  );
}

function RoleBadge({ role }) {
  const style =
    role === "admin"
      ? "bg-amber-400 text-slate-900"
      : role === "employee"
      ? "bg-slate-700 text-amber-300"
      : "bg-slate-800 text-slate-400";
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style}`}>
      {ROLES.find((r) => r.id === role)?.label ?? role}
    </span>
  );
}
