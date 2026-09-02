import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/* ==============================================================
   DIRECCIÓN PREDETERMINADA
   Trae la dirección guardada del cliente para autocompletar el
   checkout, y la guarda de vuelta cuando confirma un pedido.

   `ready` avisa cuándo terminó la consulta: el formulario solo
   debe autocompletarse una vez y con datos ya cargados, si no
   pisaría lo que el cliente esté escribiendo.
============================================================== */
export function useDefaultAddress(userId) {
  const [address, setAddress] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("profile_id", userId)
        .eq("is_default", true)
        .maybeSingle();
      if (!active) return;
      setAddress(data ?? null);
      setReady(true);
    })();
    return () => { active = false; };
  }, [userId]);

  /* Guarda (o actualiza) la dirección predeterminada. Se llama al
     confirmar el pedido, así el cliente no tiene que llenar un
     formulario aparte solo para que la próxima vez sea más rápido. */
  const saveDefault = async ({ province, city, notes }) => {
    if (!userId) return { ok: false };
    const row = {
      profile_id: userId,
      province,
      city,
      notes: notes || null,
      is_default: true,
    };
    const query = address?.id
      ? supabase.from("addresses").update(row).eq("id", address.id).select().maybeSingle()
      : supabase.from("addresses").insert(row).select().maybeSingle();
    const { data, error } = await query;
    if (error) return { ok: false, error: error.message };
    setAddress(data ?? null);
    return { ok: true };
  };

  return { address, ready: userId ? ready : true, saveDefault };
}
