import { CONFIG, money } from "../config/store";
import { PAYMENT_METHODS } from "../data/paymentMethods";
import { displayPanamaPhone } from "./phone";

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
export function buildChatLink({ productName, outOfStock } = {}) {
  const hola = `¡Hola ${CONFIG.storeName}! 👋`;
  let text;
  if (productName && outOfStock) {
    // Agotado: la pregunta real es cuándo vuelve, no los detalles.
    text = `${hola} Vi que *${productName}* está agotado. ¿Cuándo lo tendrán disponible?`;
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
export function buildWhatsAppLink(cartItems, form, payMethod, totals) {
  const payLabel = PAYMENT_METHODS.find((m) => m.id === payMethod)?.label || payMethod;
  const lines = [
    `🛍️ *NUEVO PEDIDO — ${CONFIG.storeName}*`,
    "━━━━━━━━━━━━━━━",
    ...cartItems.map(
      ({ product, qty }) => `▪️ ${qty}× ${product.name} — ${money(product.price * qty)}`
    ),
    "",
    `📦 *Subtotal:* ${money(totals.subtotal)}`,
    `🚚 *Envío:* ${totals.shipping === 0 ? "GRATIS 🎉" : money(totals.shipping)}`,
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
