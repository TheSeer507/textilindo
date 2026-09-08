/* ==============================================================
   PAGUELOFACIL — CREAR ENLACE DE PAGO
   Edge Function (Deno). Corre en el servidor de Supabase.

   Existe por una sola razón: el CCLW y el token de PagueloFacil
   NO pueden viajar al navegador. Cualquier variable VITE_ termina
   dentro del paquete público, y con esas credenciales un tercero
   podría cobrar o consultar en nombre de la tienda.

   Flujo:
     navegador → esta función → LinkDeamon → URL de checkout
     navegador se redirige a esa URL → paga → vuelve a PF_RETURN_URL

   El monto NUNCA se toma del navegador: se relee de la base a
   partir del order_id. Si no, cualquiera podría pedir un enlace
   de $0.01 para un pedido de $100.
============================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ENDPOINTS = {
  sandbox: "https://sandbox.paguelofacil.com/LinkDeamon.cfm",
  production: "https://secure.paguelofacil.com/LinkDeamon.cfm",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** PagueloFacil pide la URL de retorno codificada en hexadecimal. */
const toHex = (s: string) =>
  Array.from(new TextEncoder().encode(s))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const { orderId } = await req.json();
    if (!orderId) return json({ error: "Falta orderId" }, 400);

    const cclw = Deno.env.get("PF_CCLW");
    const env = (Deno.env.get("PF_ENV") ?? "sandbox") as keyof typeof ENDPOINTS;
    const returnUrl = Deno.env.get("PF_RETURN_URL") ?? "";
    if (!cclw) return json({ error: "PF_CCLW no configurado" }, 500);

    /* Service role: la función necesita leer cualquier pedido, incluido
       el de un invitado sin sesión. Esta clave solo existe aquí. */
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total, tax, status")
      .eq("id", orderId)
      .single();

    if (error || !order) return json({ error: "Pedido no encontrado" }, 404);
    if (order.status === "paid") return json({ error: "Ese pedido ya está pagado" }, 409);

    const body = new URLSearchParams({
      CCLW: cclw,
      CMTN: Number(order.total).toFixed(2),
      CTAX: Number(order.tax ?? 0).toFixed(2),
      CDSC: `Textilindo pedido #${order.order_number}`.slice(0, 150),
      // PARM_1 vuelve tal cual en el callback: así sabemos qué pedido pagó.
      PARM_1: order.id,
      EXPIRES_IN: "1800", // 30 min; un enlace viejo no debe seguir cobrable
      ...(returnUrl ? { RETURN_URL: toHex(`${returnUrl}?order=${order.id}`) } : {}),
    });

    const pfRes = await fetch(ENDPOINTS[env] ?? ENDPOINTS.sandbox, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const raw = await pfRes.text();
    let parsed: Record<string, unknown> | null = null;
    try { parsed = JSON.parse(raw); } catch { /* a veces responde texto plano */ }

    // La URL puede venir en distintas formas según la versión de la API.
    const url =
      (parsed?.data as Record<string, string> | undefined)?.url ??
      (parsed?.url as string | undefined) ??
      (raw.trim().startsWith("http") ? raw.trim() : null);

    if (!url) {
      console.error("[paguelofacil] respuesta inesperada:", raw.slice(0, 500));
      return json({ error: "PagueloFacil no devolvió un enlace", detail: raw.slice(0, 300) }, 502);
    }

    return json({ url, orderNumber: order.order_number });
  } catch (e) {
    console.error("[paguelofacil] error:", e);
    return json({ error: "Error inesperado creando el enlace" }, 500);
  }
});
