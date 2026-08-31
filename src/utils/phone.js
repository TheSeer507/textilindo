/* ==============================================================
   TELÉFONOS PANAMÁ
   El formulario ya muestra un prefijo fijo "+507", así que el campo
   debe contener SOLO los 8 dígitos locales. Los clientes igual
   escriben "+507 6941-3385" o "50769413385" por costumbre — si eso
   pasa sin limpiar, el mensaje sale como "+507 50769413385".
============================================================== */

/** Deja solo los 8 dígitos locales, quitando un 507 inicial si lo escribieron. */
export function normalizePanamaPhone(input) {
  let d = String(input || "").replace(/\D/g, "");
  // "50769413385" → "69413385". Solo si sobran dígitos, para no romper
  // un número local legítimo que empiece en 507 (ej. 5076-1234).
  if (d.startsWith("507") && d.length > 8) d = d.slice(3);
  return d.slice(0, 8);
}

/** "69413385" → "6941-3385" para mostrar. */
export function formatPanamaPhone(digits) {
  const d = normalizePanamaPhone(digits);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

/** "69413385" → "+507 6941-3385" para el mensaje de WhatsApp. */
export function displayPanamaPhone(digits) {
  const d = normalizePanamaPhone(digits);
  return d ? `+507 ${formatPanamaPhone(d)}` : "";
}
