import { CONFIG, money } from "../config/store";
import { PAYMENT_METHODS } from "../data/paymentMethods";

/* ==============================================================
   WHATSAPP ORDER MESSAGE (multi-item)
============================================================== */
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
    `📱 *Teléfono:* +507 ${form.phone.trim()}`,
    `📍 *Provincia:* ${form.province}`,
    `🏘️ *Ciudad/Sector:* ${form.city.trim()}`,
  ];
  if (form.notes.trim()) lines.push(`📝 *Notas:* ${form.notes.trim()}`);
  lines.push("", `💳 *Pago:* ${payLabel}`, "━━━━━━━━━━━━━━━", "¡Confirmo mi pedido! ✅");
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}
