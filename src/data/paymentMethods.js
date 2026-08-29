import { CONFIG } from "../config/store";

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
    // COD needs no processing — the WhatsApp order IS the confirmation.
    process: async () => ({ ok: true, mode: "whatsapp" }),
  },
  {
    id: "yappy-manual",
    label: "📱 Yappy (transferencia)",
    tag: "PAGO SEGURO",
    desc: `Te enviamos el directorio ${CONFIG.yappyHandle} o el QR por WhatsApp al confirmar.`,
    enabled: true,
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
    desc: "Visa, Mastercard y Clave en línea.",
    enabled: false, // ← flip to true when integrated
    process: async () => {
      // TODO integration (requires PagueloFacil merchant account):
      // 1. Create serverless endpoint /api/pf/create-link
      // 2. It calls PagueloFacil's LinkDeamon/API with CCLW + amount + order ref
      // 3. Redirect the customer to the returned secure payment URL
      return { ok: false, error: "No disponible aún" };
    },
  },
];
