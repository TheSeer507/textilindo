import { CONFIG } from "../config/store";
import { supabase } from "../lib/supabaseClient";

/* ==============================================================
   PAYMENT LAYER — the part built for the future
   Each method is an adapter. Today all roads lead to WhatsApp;
   when you get Yappy Comercial / PagueloFacil credentials you
   implement `process()` for that method WITHOUT touching the UI.

   ⚠️ Real card/Yappy processing requires a small backend endpoint
   (Vercel/Netlify serverless function) so your API keys are never
   exposed in the browser. The `process()` stubs mark exactly where
   that call goes.
============================================================== */
export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "💵 Efectivo contra entrega",
    tag: "⚡ ENTREGA INMEDIATA",
    desc: "Paga en efectivo cuando recibas tu pedido. Sin adelantos.",
    enabled: true,
    mode: "whatsapp",
    // COD needs no processing — the WhatsApp order IS the confirmation.
    process: async () => ({ ok: true, mode: "whatsapp" }),
  },
  {
    id: "yappy-manual",
    label: "📱 Yappy (transferencia)",
    tag: "PAGO SEGURO",
    desc: `Te enviamos el directorio ${CONFIG.yappyHandle} o el QR por WhatsApp al confirmar.`,
    enabled: true,
    mode: "whatsapp",
    process: async () => ({ ok: true, mode: "whatsapp" }),
  },
  {
    id: "yappy-boton",
    label: "🔵 Botón de Pago Yappy",
    tag: "PRÓXIMAMENTE",
    desc: "Pago automático dentro de la página con tu app de Banco General.",
    enabled: false, // ← flip to true when integrated
    process: async () => {
      // TODO integration (requires Yappy Comercial account):
      // 1. Create serverless endpoint /api/yappy/create-order
      // 2. It calls Yappy's API with your merchant credentials and the order total
      // 3. Return the payment URL/session and redirect the customer to it
      // return fetch("/api/yappy/create-order", { method: "POST", body: JSON.stringify(order) })
      return { ok: false, error: "No disponible aún" };
    },
  },
  {
    id: "paguelofacil",
    label: "💳 Tarjeta (PagueloFacil)",
    tag: "PRÓXIMAMENTE",
    desc: "Visa, Mastercard y Clave en línea. Pagas en la página segura de PagueloFacil.",
    /* Apagado en producción a propósito.
       Toda la plomería ya funciona (Edge Functions desplegadas, pedido
       guardado, verificación), pero las credenciales son del ambiente
       DEMO: un cliente real que elija tarjeta terminaría en un checkout
       de prueba que no cobra. Peor que no ofrecer la opción.

       Para encender:
         1. credenciales reales de app.paguelofacil.com
         2. PF_ENV=production en supabase/functions/.env
         3. npm run sb:secrets && npm run sb:deploy
         4. enabled: true y tag: "PAGO SEGURO"

       Para probar en local sin publicarlo, basta con poner true aquí
       y no subir el cambio. */
    enabled: false,
    /* "redirect" le dice al carrito que NO abra WhatsApp: este método
       manda al cliente a la pasarela. El pedido tiene que estar guardado
       antes, porque el monto se relee en el servidor a partir del id. */
    mode: "redirect",
    process: async ({ orderId }) => {
      if (!orderId) {
        return { ok: false, error: "No se pudo registrar el pedido. Intenta de nuevo o paga por WhatsApp." };
      }
      // El CCLW y el token viven en la Edge Function, nunca en el navegador.
      const { data, error } = await supabase.functions.invoke("paguelofacil-checkout", {
        body: { orderId },
      });
      if (error) return { ok: false, error: "No se pudo abrir el pago con tarjeta. Intenta otra vez." };
      if (!data?.url) return { ok: false, error: data?.error || "PagueloFacil no devolvió un enlace." };
      return { ok: true, mode: "redirect", url: data.url };
    },
  },
];
