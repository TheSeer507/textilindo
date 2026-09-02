export const CONFIG = {
  storeName: "Textilindo",
  whatsappNumber: "50769413385", // número de WhatsApp Business de la tienda
  currency: "$",
  yappyHandle: "@textilindo", // ← still a placeholder, swap for your real Yappy handle
  freeShippingOver: 50,
  shippingFlat: 3.5,

  /* ITBMS — impuesto de Panamá.
     Los precios del catálogo son SIN impuesto; el 7% se suma al final.

     `itbmsOnShipping` decide si el flete también paga impuesto. Queda en
     false (solo la mercancía) porque es lo más común en tienda pequeña;
     si tu contador dice lo contrario, cámbialo a true y listo — no hay
     que tocar nada más. */
  itbmsRate: 0.07,
  itbmsOnShipping: false,
};

/* El envío gratis se mide contra el subtotal sin impuesto, para que el
   ITBMS no empuje artificialmente a un cliente sobre el umbral. */
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const money = (n) => CONFIG.currency + n.toFixed(2);

/* ==============================================================
   TOTALES DEL PEDIDO
   Un solo lugar para la aritmética: la gaveta del carrito, el
   mensaje de WhatsApp y (más adelante) el pedido guardado en la
   base tienen que coincidir al centavo.
============================================================== */
export function calcTotals(items) {
  const subtotal = round2(items.reduce((s, i) => s + i.product.price * i.qty, 0));
  const shipping =
    subtotal === 0 || subtotal >= CONFIG.freeShippingOver ? 0 : CONFIG.shippingFlat;
  const taxBase = subtotal + (CONFIG.itbmsOnShipping ? shipping : 0);
  const tax = round2(taxBase * CONFIG.itbmsRate);
  return { subtotal, shipping, tax, total: round2(subtotal + shipping + tax) };
}
