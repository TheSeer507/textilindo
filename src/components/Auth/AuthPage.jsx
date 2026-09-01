import { useState } from "react";
import { Mail, Lock, User, Phone, Building2, CheckCircle2 } from "lucide-react";
import { normalizePanamaPhone, formatPanamaPhone } from "../../utils/phone";

const inputCls =
  "w-full border border-slate-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-brand-primary";

/* ==============================================================
   ENTRAR / REGISTRARSE  (#login)
   Un solo formulario con dos modos. Correo y contraseña, que es
   lo único habilitado hoy en el proyecto de Supabase.

   Los campos de teléfono y empresa se piden en el registro porque
   son justo los que después autocompletan el checkout y permiten
   identificar clientes de mayoreo.
============================================================== */
export function AuthPage({ auth }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({
    email: "", password: "", fullName: "", phone: "", companyName: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: k === "phone" ? normalizePanamaPhone(e.target.value) : e.target.value,
    }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!form.fullName.trim()) return setError("Escribe tu nombre completo.");
      if (form.phone.length !== 8) return setError("El teléfono debe tener 8 dígitos.");
      if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    }

    setBusy(true);
    const result =
      mode === "signup"
        ? await auth.signUp({
            email: form.email.trim(),
            password: form.password,
            fullName: form.fullName.trim(),
            phone: form.phone,
            companyName: form.companyName.trim(),
          })
        : await auth.signIn({ email: form.email.trim(), password: form.password });
    setBusy(false);

    if (!result.ok) return setError(translate(result.error));
    if (result.needsConfirmation) return setSent(true);
    window.location.hash = ""; // sesión lista → de vuelta al catálogo
  };

  if (sent) {
    return (
      <Shell>
        <div className="text-center py-6">
          <CheckCircle2 size={48} className="mx-auto text-green-500" strokeWidth={1.5} />
          <h1 className="font-display font-semibold text-2xl mt-4">Revisa tu correo</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Le enviamos un enlace de confirmación a <strong>{form.email}</strong>.
            Ábrelo para activar tu cuenta y luego vuelve a entrar.
          </p>
          <button
            onClick={() => { setSent(false); setMode("signin"); }}
            className="mt-6 text-sm font-semibold text-brand-primary underline"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </Shell>
    );
  }

  const isSignup = mode === "signup";

  return (
    <Shell>
      <h1 className="font-display font-semibold text-3xl tracking-tight">
        {isSignup ? "Crear cuenta" : "Iniciar sesión"}
      </h1>
      <p className="text-slate-500 text-sm mt-2">
        {isSignup
          ? "Guarda tus datos de entrega y sigue tus pedidos."
          : "Entra para ver tus pedidos y direcciones guardadas."}
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        {isSignup && (
          <>
            <Field icon={User} label="Nombre completo *">
              <input className={inputCls} value={form.fullName} onChange={set("fullName")}
                placeholder="Ej. Ana Rodríguez" autoComplete="name" />
            </Field>
            <Field icon={Phone} label="Teléfono (WhatsApp) *">
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 rounded-l-xl bg-slate-50 text-base font-semibold shrink-0">
                  +507
                </span>
                <input className={inputCls + " rounded-l-none"} value={formatPanamaPhone(form.phone)}
                  onChange={set("phone")} placeholder="6123-4567" inputMode="numeric"
                  autoComplete="tel-national" maxLength={9} />
              </div>
            </Field>
            <Field icon={Building2} label="Empresa (opcional)">
              <input className={inputCls} value={form.companyName} onChange={set("companyName")}
                placeholder="Si compras para un negocio" autoComplete="organization" />
            </Field>
          </>
        )}

        <Field icon={Mail} label="Correo *">
          <input type="email" required className={inputCls} value={form.email} onChange={set("email")}
            placeholder="tucorreo@ejemplo.com" autoComplete="email" />
        </Field>

        <Field icon={Lock} label="Contraseña *">
          <input type="password" required className={inputCls} value={form.password}
            onChange={set("password")} placeholder={isSignup ? "Mínimo 8 caracteres" : "••••••••"}
            autoComplete={isSignup ? "new-password" : "current-password"} />
        </Field>

        {error && <p className="text-sm font-semibold text-orange-600">{error}</p>}

        <button type="submit" disabled={busy}
          className="w-full bg-brand-primary hover:bg-brand-primary-dark disabled:opacity-60 text-white font-black py-4 rounded-2xl transition">
          {busy ? "Un momento…" : isSignup ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-6 text-center">
        {isSignup ? "¿Ya tienes cuenta?" : "¿Eres nuevo?"}{" "}
        <button
          onClick={() => { setMode(isSignup ? "signin" : "signup"); setError(""); }}
          className="font-bold text-brand-primary hover:underline"
        >
          {isSignup ? "Inicia sesión" : "Regístrate"}
        </button>
      </p>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-20">
      <div className="bg-white rounded-3xl shadow-sm p-7 md:p-9">{children}</div>
      <p className="text-center mt-6">
        <a href="#" className="text-sm font-semibold text-slate-500 hover:text-brand-primary">
          ← Volver al catálogo
        </a>
      </p>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-1">
        <Icon size={14} strokeWidth={2} className="text-slate-400" /> {label}
      </label>
      {children}
    </div>
  );
}

/* Supabase responde en inglés; traducimos los casos que el cliente
   sí puede resolver por su cuenta. */
function translate(msg = "") {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Aún no confirmas tu correo. Revisa tu bandeja de entrada.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Ese correo ya tiene cuenta. Inicia sesión.";
  if (m.includes("password")) return "La contraseña debe tener al menos 8 caracteres.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Demasiados intentos seguidos. Espera un momento y vuelve a probar.";
  return msg;
}
