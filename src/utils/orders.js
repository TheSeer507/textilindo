import { supabase } from "../lib/supabaseClient";
import { normalizePanamaPhone } from "./phone";

/* ==============================================================
   GUARDAR EL PEDIDO

   Se llama al confirmar, ANTES de abrir WhatsApp, para poder citar
   el número de pedido en el mensaje. Pero la venta manda: si la base
   tarda o falla, igual se abre WhatsApp — solo que sin el número.
   Por eso hay un tiempo límite y por eso nunca lanza excepción.
============================================================== */

const TIMEOUT_MS = 4000;

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), ms)),
  ]);

/**
 * Inserta el pedido y sus renglones.
 * Devuelve { ok, orderNumber } — nunca tira error.
 */
export async function saveOrder({ items, form, payMethod, totals, userId }) {
  try {
    const result = await withTimeout(
      (async () => {
        /* Una sola llamada a create_order() en vez de dos inserts:
           es atómica (no deja pedidos sin renglones), es un solo viaje
           de red antes de abrir WhatsApp, y esquiva el problema de que
           un invitado no puede leer `orders` desde la política de
           order_items. Ver el comentario en 0004_orders.sql. */
        const { data, error } = await supabase.rpc("create_order", {
          p_customer_id: userId ?? null,
          p_guest_name: form.name.trim(),
          p_guest_phone: normalizePanamaPhone(form.phone),
          p_province: form.province,
          p_city: form.city.trim(),
          p_notes: form.notes?.trim() || null,
          p_subtotal: totals.subtotal,
          p_shipping: totals.shipping,
          p_tax: totals.tax,
          p_total: totals.total,
          p_payment_method: payMethod,
          // Nombre y precio COPIADOS: si mañana sube el precio de la tela,
          // este pedido debe seguir mostrando lo que se cobró hoy.
          p_items: items.map(({ product, qty }) => ({
            product_id: product.id,
            product_name: product.name,
            unit_price: product.price,
            qty,
          })),
        });

        if (error) return { ok: false, error: error.message };
        const row = Array.isArray(data) ? data[0] : data;
        return { ok: true, orderNumber: row?.order_number };
      })(),
      TIMEOUT_MS
    );

    if (result.timedOut) {
      console.warn("[pedido] la base tardó demasiado; se sigue sin número");
      return { ok: false, timedOut: true };
    }
    if (!result.ok) console.error("[pedido] no se pudo guardar:", result.error);
    return result;
  } catch (e) {
    // Ni un fallo inesperado puede impedir que el cliente compre.
    console.error("[pedido] error inesperado:", e);
    return { ok: false };
  }
}

/** Pedidos del cliente que está en sesión, con sus renglones. */
export async function fetchMyOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  return error ? { ok: false, error: error.message, orders: [] } : { ok: true, orders: data ?? [] };
}

export const ORDER_STATUS = [
  { id: "pending",   label: "Pendiente",  hint: "Esperando confirmación por WhatsApp" },
  { id: "confirmed", label: "Confirmado", hint: "Acordado con el cliente" },
  { id: "paid",      label: "Pagado",     hint: "Pago recibido" },
  { id: "delivered", label: "Entregado",  hint: "En manos del cliente" },
  { id: "cancelled", label: "Cancelado",  hint: "No cuenta como venta" },
];

export const statusLabel = (id) =>
  ORDER_STATUS.find((s) => s.id === id)?.label ?? id;
