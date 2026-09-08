/* ==============================================================
   PAGUELOFACIL — NOTIFICACIÓN DE PAGO (webhook)

   Es la ÚNICA fuente confiable de "esto se pagó". El regreso del
   cliente a RETURN_URL no sirve para marcar el pedido: puede cerrar
   la pestaña antes de volver, o manipular la URL. El webhook lo
   manda PagueloFacil servidor a servidor.

   URL a registrar con soporte de PagueloFacil:
     https://<proyecto>.supabase.co/functions/v1/paguelofacil-webhook

   Ojo: hay que desplegarla con --no-verify-jwt, porque quien llama
   es PagueloFacil y no trae token de Supabase.
============================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ok = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Acepta JSON o form-urlencoded: PagueloFacil usa ambos según el caso. */
async function readParams(req: Request): Promise<Record<string, string>> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    return (await req.json()) as Record<string, string>;
  }
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    // Algunas configuraciones notifican por GET con query string.
    const params =
      req.method === "GET"
        ? Object.fromEntries(url.searchParams)
        : await readParams(req);

    // PARM_1 lo mandamos nosotros al crear el enlace: es el id del pedido.
    const orderId = params.PARM_1 ?? params.parm_1 ?? url.searchParams.get("order");
    const estado = (params.Estado ?? params.estado ?? "").toLowerCase();
    const oper = params.Oper ?? params.oper ?? null;
    const totalPagado = Number(params.TotalPagado ?? params.totalPagado ?? 0);

    if (!orderId) {
      console.error("[pf-webhook] sin PARM_1:", JSON.stringify(params).slice(0, 400));
      return ok({ received: true, note: "sin identificador de pedido" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const approved = estado.includes("aprobada") && totalPagado > 0;

    /* Solo se marca 'paid'. Un pago rechazado NO cancela el pedido: el
       cliente puede reintentar, o cerrarlo por WhatsApp como siempre.
       Cancelar aquí perdería la venta. */
    if (!approved) {
      console.log(`[pf-webhook] pedido ${orderId} no aprobado (${estado})`);
      return ok({ received: true, approved: false });
    }

    const { error } = await supabase
      .from("orders")
      .update({ status: "paid", payment_ref: oper })
      .eq("id", orderId)
      .neq("status", "cancelled"); // un pedido ya cancelado no revive

    if (error) {
      console.error("[pf-webhook] no se pudo actualizar:", error.message);
      return ok({ received: true, updated: false }, 200); // 200: que PF no reintente en bucle
    }

    console.log(`[pf-webhook] pedido ${orderId} marcado como pagado (oper ${oper})`);
    return ok({ received: true, approved: true });
  } catch (e) {
    console.error("[pf-webhook] error:", e);
    return ok({ received: true }, 200);
  }
});
