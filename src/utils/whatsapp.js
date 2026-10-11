import { CONFIG, money } from "../config/store";
import { PAYMENT_METHODS } from "../data/paymentMethods";
import { displayPanamaPhone } from "./phone";
import { lineName, unitOf } from "./catalog";

/* ==============================================================
   WHATSAPP LINKS
   Every outbound WhatsApp URL in the app is built here so the
   number lives in exactly one place (CONFIG.whatsappNumber).

   wa.me is the official click-to-chat endpoint and works the same
   on phone (opens the app) and desktop (opens WhatsApp Web).
============================================================== */

/** Base builder: a wa.me link to the store with `text` pre-typed. */
export function waHref(text) {
  const base = `https://wa.me/${CONFIG.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/* --------------------------------------------------------------
   1. GENERAL CHAT — the floating button and any "ask us" link.
   `productName` makes the greeting specific when the customer is
   looking at a product, so the rep knows what they're asking about.
-------------------------------------------------------------- */
export function buildChatLink({ productName, outOfStock, askPrice, range, unit } = {}) {
  const hola = `¡Hola ${CONFIG.storeName}! 👋`;
  let text;
  if (productName && outOfStock) {
    // Agotado: la pregunta real es cuándo vuelve, no los detalles.
    text = `${hola} Vi que *${productName}* está agotado. ¿Cuándo lo tendrán disponible?`;
  } else if (productName && range) {
    // La tienda publicó más de un precio sin decir de qué depende: el
    // cliente llega citando las cifras que vio, para que el vendedor
    // solo tenga que decir cuál corresponde.
    const cada = unit ? ` la ${unit}` : "";
    text = `${hola} Me interesa *${productName}*. Vi que cuesta entre ${money(range.min)} y ${money(range.max)}${cada}. ¿Me pueden decir cuál precio aplica y los colores disponibles?`;
  } else if (productName && askPrice) {
    // Producto sin precio publicado: el vendedor recibe la pregunta ya
    // hecha, con las dos cosas que el cliente quiere saber de una tela.
    text = `${hola} Me interesa *${productName}*. ¿Me pueden dar el precio y los colores disponibles?`;
  } else if (productName) {
    text = `${hola} Me interesa *${productName}*. ¿Me pueden dar más información?`;
  } else {
    text = `${hola} Quisiera más información sobre sus productos.`;
  }
  return waHref(text);
}

/* --------------------------------------------------------------
   2. ORDER HANDOFF — the full cart, sent when the customer
   confirms. The sales rep reads this, confirms stock, and closes
   payment and delivery in the same thread.
-------------------------------------------------------------- */
export function buildWhatsAppLink(cartItems, form, payMethod, totals, orderNumber) {
  const payLabel = PAYMENT_METHODS.find((m) => m.id === payMethod)?.label || payMethod;
  const lines = [
    orderNumber
      ? `🛍️ *PEDIDO #${orderNumber} — ${CONFIG.storeName}*`
      : `🛍️ *NUEVO PEDIDO — ${CONFIG.storeName}*`,
    "━━━━━━━━━━━━━━━",
    /* El vendedor tiene que poder leer el renglón sin adivinar: cuánto
       (en yardas si es tela), de qué (con el ancho o tipo elegido), a
       cómo la yarda y cuánto suma.
         ▪️ 3 yd × Organza — 120″ de ancho ($3.95/yd) — $11.85
         ▪️ 2× Colorante para ropa Mariposa — $5.00            */
    ...cartItems.map(({ product, variant, qty }) => {
      const { short } = unitOf(product);
      const amount = short ? `${qty} ${short} ×` : `${qty}×`;
      const each = short ? ` (${money(variant.price)}/${short})` : "";
      return `▪️ ${amount} ${lineName(product, variant)}${each} — ${money(variant.price * qty)}`;
    }),
    "",
    `📦 *Subtotal:* ${money(totals.subtotal)}`,
    `🚚 *Envío:* ${totals.shipping === 0 ? "GRATIS 🎉" : money(totals.shipping)}`,
    `🧾 *ITBMS (${Math.round(CONFIG.itbmsRate * 100)}%):* ${money(totals.tax)}`,
    `💰 *TOTAL:* ${money(totals.total)}`,
    "",
    `👤 *Cliente:* ${form.name.trim()}`,
    `📱 *Teléfono:* ${displayPanamaPhone(form.phone)}`,
    `📍 *Provincia:* ${form.province}`,
    `🏘️ *Ciudad/Sector:* ${form.city.trim()}`,
  ];
  if (form.notes.trim()) lines.push(`📝 *Notas:* ${form.notes.trim()}`);
  lines.push("", `💳 *Pago:* ${payLabel}`, "━━━━━━━━━━━━━━━", "¡Confirmo mi pedido! ✅");
  return waHref(lines.join("\n"));
}
