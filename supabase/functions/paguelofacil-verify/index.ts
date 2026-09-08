/* ==============================================================
   PAGUELOFACIL — VERIFICAR AL REGRESAR

   Se llama desde #pago cuando el cliente vuelve de la pasarela.

   EL PROBLEMA DE FONDO
   Los datos que trae el navegador al regresar (Estado, Oper,
   TotalPagado) los puede editar cualquiera en la barra de
   direcciones. Marcar 'paid' creyéndoles significa que alguien
   escribe "Estado=Aprobada" y se lleva la mercancía gratis.

   Por eso esta función NUNCA marca pagado por lo que dice el
   navegador. Solo lo hace si puede confirmarlo contra el servidor
   de PagueloFacil (PF_TX_LOOKUP_URL). Si no hay forma de
   confirmar, deja el pedido en 'pending' y guarda el número de
   operación como REPORTADO, para que alguien lo coteje en el panel
   de PagueloFacil. Es preferible una venta que revisar a mano que
   un pedido dado por pagado sin serlo.

   Cuando se tenga el endpoint de consulta (o el webhook), esto
   pasa a confirmar solo, sin tocar el resto del código.
============================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

/** Pregunta a PagueloFacil si la operación existe y fue aprobada. */
async function confirmWithGateway(oper: string): Promise<boolean | null> {
  const template = Deno.env.get("PF_TX_LOOKUP_URL");
  const token = Deno.env.get("PF_TOKEN");
  if (!template || !token || !oper) return null; // no hay canal de confirmación

  try {
    const res = await fetch(template.replace("{oper}", encodeURIComponent(oper)), {
      headers: { Authorization: token, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const body = await res.json();
    const blob = JSON.stringify(body).toLowerCase();
    if (body?.success === false) return null;
    return blob.includes("aprobada") || blob.includes("approved");
  } catch (e) {
    console.error("[pf-verify] consulta fallida:", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const { orderId, oper = null, estado = "" } = await req.json();
    if (!orderId) return json({ error: "Falta orderId" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total, payment_ref")
      .eq("id", orderId)
      .single();

    if (error || !order) return json({ error: "Pedido no encontrado" }, 404);

    // El webhook pudo haber llegado primero: entonces ya está resuelto.
    if (order.status === "paid") {
      return json({ status: "paid", orderNumber: order.order_number, confirmed: true });
    }
    if (order.status === "cancelled") {
      return json({ status: "cancelled", orderNumber: order.order_number });
    }

    const confirmed = await confirmWithGateway(oper);

    if (confirmed === true) {
      await supabase
        .from("orders")
        .update({ status: "paid", payment_ref: oper })
        .eq("id", orderId)
        .neq("status", "cancelled");
      return json({ status: "paid", orderNumber: order.order_number, confirmed: true });
    }

    /* No se pudo confirmar. Se guarda lo que dijo el navegador como
       REPORTE (prefijo "reportado:") para que en el panel se distinga
       de un pago confirmado, y el pedido sigue en 'pending'. */
    if (oper && !order.payment_ref) {
      await supabase
        .from("orders")
        .update({ payment_ref: `reportado:${oper}` })
        .eq("id", orderId)
        .eq("status", "pending");
    }

    return json({
      status: "pending",
      orderNumber: order.order_number,
      confirmed: false,
      reported: estado || null,
    });
  } catch (e) {
    console.error("[pf-verify] error:", e);
    return json({ error: "Error verificando el pago" }, 500);
  }
});
