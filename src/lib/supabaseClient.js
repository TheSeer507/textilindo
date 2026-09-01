import { createClient } from "@supabase/supabase-js";

/* ==============================================================
   CLIENTE SUPABASE
   Único punto donde se crea la conexión. Todo lo demás (hooks,
   componentes) importa `supabase` desde aquí.

   La clave publishable es pública a propósito: viaja al navegador
   y lo que realmente protege los datos son las políticas RLS
   definidas en supabase/migrations/. La clave "secret" jamás debe
   aparecer en este proyecto.
============================================================== */

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // Falla temprano y claro: sin esto, cada llamada fallaría con un
  // error críptico de red mucho más adelante.
  throw new Error(
    "Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Copia .env.example a .env (local) y créalas también en Netlify."
  );
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,      // la sesión sobrevive al refresh
    autoRefreshToken: true,
    detectSessionInUrl: true,  // necesario para confirmación por correo y OAuth
  },
});
