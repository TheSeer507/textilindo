import { UserRound, Mail, Phone, Building2, LayoutDashboard, LogOut } from "lucide-react";
import { formatPanamaPhone } from "../../utils/phone";

/* ==============================================================
   MI CUENTA (#cuenta)
   Por ahora muestra los datos del perfil y la salida de sesión.
   El historial de pedidos y las direcciones guardadas entran aquí
   cuando se creen esas tablas (fase 4 del plan).
============================================================== */
export function AccountPage({ auth }) {
  const { profile, user, isStaff, isAdmin, signOut } = auth;

  const rows = [
    { icon: UserRound, label: "Nombre", value: profile?.full_name },
    { icon: Mail, label: "Correo", value: profile?.email || user?.email },
    { icon: Phone, label: "Teléfono", value: profile?.phone ? `+507 ${formatPanamaPhone(profile.phone)}` : null },
    { icon: Building2, label: "Empresa", value: profile?.company_name },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <div className="flex items-center gap-4">
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt=""
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        )}
        <h1 className="font-display font-semibold text-3xl tracking-tight">Mi cuenta</h1>
      </div>

      {/* Google no entrega teléfono, y el pedido se cierra por WhatsApp. */}
      {!profile?.phone && (
        <p className="mt-5 text-sm text-orange-800 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
          Aún no tenemos tu teléfono. Te lo pediremos al hacer tu primer pedido
          para coordinarlo por WhatsApp.
        </p>
      )}

      {isStaff && (
        <div className="mt-6 flex items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl px-5 py-4">
          <div>
            <p className="font-bold text-sm">
              Acceso interno · {isAdmin ? "Administrador" : "Empleado"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Puedes ver el panel de operaciones y los usuarios registrados.
            </p>
          </div>
          <a
            href="#admin"
            className="shrink-0 flex items-center gap-1.5 bg-brand-accent text-brand-primary text-sm font-black px-4 py-2.5 rounded-xl hover:bg-brand-accent-dark transition-colors"
          >
            <LayoutDashboard size={16} strokeWidth={2.5} /> Panel
          </a>
        </div>
      )}

      <div className="mt-6 bg-white rounded-3xl shadow-sm divide-y divide-slate-100">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-4">
            <Icon size={18} strokeWidth={2} className="text-slate-400 shrink-0" />
            <span className="text-sm text-slate-500 w-24 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-slate-900 truncate">
              {value || <span className="text-slate-300 font-normal">Sin registrar</span>}
            </span>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500 mt-6">
        Tu historial de pedidos y direcciones guardadas aparecerán aquí próximamente.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#"
          className="font-semibold text-sm border border-slate-300 rounded-2xl px-5 py-3 hover:bg-white transition-colors"
        >
          ← Volver al catálogo
        </a>
        <button
          onClick={async () => { await signOut(); window.location.hash = ""; }}
          className="flex items-center gap-2 font-semibold text-sm text-slate-600 border border-slate-300 rounded-2xl px-5 py-3 hover:bg-white hover:text-red-600 hover:border-red-300 transition-colors"
        >
          <LogOut size={16} strokeWidth={2} /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
