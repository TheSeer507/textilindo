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

/* ==============================================================
   ⬇⬇  CONTACTO — EDITAR AQUÍ  ⬇⬇
   Esto es lo que sale en "Contáctanos" en el pie de página.

   Cualquier campo que quede en "" simplemente NO se muestra: el pie
   se acomoda solo. Así se puede ir llenando a medida que el dueño
   confirme los datos, sin que quede un correo falso publicado ni un
   enlace roto mientras tanto.
============================================================== */
export const CONTACT = {
  supportEmail: "textilindo@gmail.com",   // ej. "soporte@textilindo.com"
  salesEmail: "",                         // ej. "ventas@textilindo.com"
  address: "Colón, Calle 9 y Avenida Bolívar",

  /* Horario: una línea por renglón. El pie los apila y los alinea, así
     que aquí no hacen falta saltos de línea ni espacios de relleno. */
  hours: [
    { days: "Lunes a viernes", time: "8:30 a.m. – 5:30 p.m." },
    { days: "Sábados",         time: "8:30 a.m. – 5:00 p.m." },
    // { days: "Domingos", time: "Cerrado" },
  ],
};

/* Redes sociales: pegar la URL COMPLETA del perfil, no el usuario.
   Ej. "https://www.instagram.com/textilindo"
   Lo que quede en "" no aparece. */
export const SOCIAL = {
  instagram: "https://www.instagram.com/textilindocolon",
  facebook: "https://www.facebook.com/share/18rpg6aDL6/",
  tiktok: "https://www.tiktok.com/@textilindoavenidabolivar",
  youtube: "",
  x: "",
};
/* ==============================================================
   ⬆⬆  FIN DE LO EDITABLE  ⬆⬆
============================================================== */

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
