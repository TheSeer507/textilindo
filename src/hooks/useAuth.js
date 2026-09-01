import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

/* ==============================================================
   SESIÓN Y PERFIL
   Expone al resto de la app: quién está conectado, su perfil
   (con el rol) y las acciones de entrar / registrarse / salir.

   `loading` arranca en true para que las rutas protegidas no
   parpadeen: sin eso, #admin mostraría "no autorizado" por un
   instante antes de que Supabase restaure la sesión guardada.
============================================================== */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // El perfil se busca aparte de la sesión: ahí vive el rol, y es lo
  // que decide si alguien ve el panel.
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return; // sin sesión no hay nada que pedir
    let active = true;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data ?? null);
      });
    return () => { active = false; };
  }, [userId]);

  // Al cerrar sesión, `profile` todavía guarda el perfil anterior por un
  // instante. Se descarta aquí en vez de limpiarlo dentro del efecto, que
  // provocaría un render en cascada.
  const activeProfile = userId ? profile : null;

  const signUp = useCallback(async ({ email, password, fullName, phone, companyName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // El trigger handle_new_user() lee estos campos para armar el perfil.
        data: { full_name: fullName, phone, company_name: companyName || null },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { ok: false, error: error.message };
    // Si el proyecto exige confirmación por correo, aquí todavía no hay
    // sesión: hay que avisarle al cliente que revise su bandeja.
    return { ok: true, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    profile: activeProfile,
    loading,
    isStaff: activeProfile?.role === "employee" || activeProfile?.role === "admin",
    isAdmin: activeProfile?.role === "admin",
    signUp,
    signIn,
    signOut,
  };
}
