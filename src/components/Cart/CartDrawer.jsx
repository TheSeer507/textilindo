import { useState } from "react";
import { CONFIG, money } from "../../config/store";
import { PAYMENT_METHODS } from "../../data/paymentMethods";
import { buildWhatsAppLink } from "../../utils/whatsapp";
import { normalizePanamaPhone } from "../../utils/phone";
import { supabase } from "../../lib/supabaseClient";
import { saveOrder } from "../../utils/orders";
import { useDefaultAddress } from "../../hooks/useDefaultAddress";
import { CartItemsView } from "./CartItemsView";
import { ShippingForm } from "./ShippingForm";
import { PaymentMethods } from "./PaymentMethods";
import { OrderConfirmation } from "./OrderConfirmation";

const emptyForm = { name: "", phone: "", province: "", city: "", notes: "" };

export function CartDrawer({ open, onClose, items, totals, changeQty, removeItem, auth }) {
  // view: "cart" → "shipping" → "payment" → "done"
  const [view, setView] = useState("cart");
  const [form, setForm] = useState(emptyForm);
  const [payMethod, setPayMethod] = useState(null);
  const [error, setError] = useState("");
  const [waLink, setWaLink] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [saveData, setSaveData] = useState(true);
  const [orderNumber, setOrderNumber] = useState(null);

  const profile = auth?.profile;
  const userId = auth?.user?.id ?? null;
  const { address, ready: addressReady, saveDefault } = useDefaultAddress(userId);

  // Reset the wizard back to "cart" whenever the drawer transitions to open —
  // done during render (React's documented pattern for "adjust state when a
  // prop changes") instead of an effect, so it doesn't cause an extra commit.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setView("cart"); setError(""); }
  }

  /* ---- AUTOCOMPLETADO ----
     Se rellena una sola vez, cuando ya cargaron perfil y dirección, y
     solo sobre campos vacíos: si se repitiera en cada render pisaría lo
     que el cliente esté escribiendo. `filledFor` recuerda a quién se le
     llenó, para volver a hacerlo si cambia de sesión. */
  const [filledFor, setFilledFor] = useState(null);
  if (userId && addressReady && profile && filledFor !== userId) {
    setFilledFor(userId);
    setForm((f) => ({
      ...f,
      name: f.name || profile.full_name || "",
      phone: f.phone || profile.phone || "",
      province: f.province || address?.province || "",
      city: f.city || address?.city || "",
      notes: f.notes || address?.notes || "",
    }));
  }
  if (!userId && filledFor) setFilledFor(null); // cerró sesión

  /* `items` y `totals` llegan desde useCart: la barra inferior muestra
     las mismas cifras y así no hay dos cálculos que puedan discrepar. */

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // El teléfono se guarda siempre como 8 dígitos limpios, sin el 507.
  const setPhone = (e) => setForm((f) => ({ ...f, phone: normalizePanamaPhone(e.target.value) }));
  const shippingValid =
    form.name.trim() && form.phone.length === 8 && form.province && form.city.trim();

  /* El botón tiene que decir la verdad de lo que va a pasar: con tarjeta
     lleva a la pasarela, no a WhatsApp. Prometer WhatsApp y abrir otra
     cosa es la clase de sorpresa que hace abandonar un carrito. */
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === payMethod);
  const isRedirect = selectedMethod?.mode === "redirect";

  const confirmOrder = async () => {
    const method = PAYMENT_METHODS.find((m) => m.id === payMethod);
    if (!method) { setError("Elige un método de pago para confirmar."); return; }

    // Claim the tab synchronously, while we are still inside the click.
    // `await` below ends the user-gesture window, and mobile Safari blocks
    // any window.open() made after that point — so open first, aim later.
    const tab = window.open("", "_blank");

    setProcessing(true);

    /* El pedido se guarda PRIMERO, siempre:
       - para WhatsApp, porque así el mensaje puede citar el #124 y
         vendedor y cliente comparten una referencia;
       - para la pasarela, porque el servidor relee el monto desde la
         base a partir del id (si el monto viniera del navegador,
         cualquiera podría pagar $0.01 por un pedido de $100).

       saveOrder nunca lanza excepción y se rinde a los 4 s. */
    const saved = await saveOrder({ items, form, payMethod, totals, userId });

    const result = await method.process({ items, form, totals, orderId: saved.orderId });
    setProcessing(false);

    if (!result.ok) {
      tab?.close();
      setError(result.error || "No se pudo procesar el pago.");
      return;
    }

    setOrderNumber(saved.orderNumber ?? null);

    /* Dos desenlaces posibles. La pestaña ya está abierta desde el clic,
       así que en ambos casos solo hay que apuntarla. */
    const destination =
      result.mode === "redirect"
        ? result.url // pasarela: página segura de PagueloFacil
        : buildWhatsAppLink(items, form, payMethod, totals, saved.orderNumber);

    if (result.mode !== "redirect") setWaLink(destination);

    if (tab) tab.location.href = destination;
    else window.location.href = destination; // popup bloqueado: en esta pestaña
    setView("done");

    /* Guardar los datos va DESPUÉS de abrir WhatsApp y sin await: si la
       base tarda o falla, el pedido igual sale. Es una comodidad para la
       próxima compra, no un paso del que dependa esta. */
    if (userId && saveData) {
      saveDefault({ province: form.province, city: form.city, notes: form.notes });
      // El teléfono de quien entró con Google llega vacío: se completa
      // con el que acaba de escribir aquí.
      if (!profile?.phone && form.phone) {
        supabase.from("profiles").update({ phone: form.phone }).eq("id", userId);
      }
    }
  };

  const title =
    view === "cart" ? `Tu carrito (${items.reduce((s, i) => s + i.qty, 0)})` :
    view === "shipping" ? "Datos de entrega" :
    view === "payment" ? "Método de pago" : "Pedido enviado";

  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40" onClick={onClose} />}
      <aside
        role="dialog" aria-modal="true" aria-label="Carrito y compra"
        className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-black text-lg text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-slate-100 text-xl" aria-label="Cerrar">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {view === "cart" && (
            <CartItemsView items={items} totals={totals} changeQty={changeQty} removeItem={removeItem} />
          )}
          {view === "shipping" && (
            <ShippingForm
              form={form} set={set} setPhone={setPhone} error={error}
              signedIn={!!userId}
              prefilled={filledFor === userId && !!(address || profile?.phone)}
              saveData={saveData}
              setSaveData={setSaveData}
            />
          )}
          {view === "payment" && (
            <PaymentMethods payMethod={payMethod} setPayMethod={setPayMethod} setError={setError} error={error} />
          )}
          {view === "done" && <OrderConfirmation waLink={waLink} orderNumber={orderNumber} />}
        </div>

        {/* ---- FOOTER: totals + primary action ---- */}
        {view !== "done" && items.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4 space-y-3 bg-white">
            <div className="text-sm space-y-1">
              <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
              <div className="flex justify-between text-slate-500">
                <span>Envío</span>
                <span className={totals.shipping === 0 ? "text-brand-primary font-bold" : ""}>{totals.shipping === 0 ? "GRATIS" : money(totals.shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>ITBMS ({Math.round(CONFIG.itbmsRate * 100)}%)</span>
                <span>{money(totals.tax)}</span>
              </div>
              <div className="flex justify-between font-black text-lg text-slate-900 pt-1"><span>Total</span><span>{money(totals.total)}</span></div>
            </div>

            {view === "cart" && (
              <button onClick={() => setView("shipping")} className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-black py-4 rounded-2xl transition">
                Finalizar pedido →
              </button>
            )}
            {view === "shipping" && (
              <div className="flex gap-3">
                <button onClick={() => setView("cart")} className="px-5 py-4 rounded-2xl border border-slate-300 font-semibold hover:bg-slate-50">←</button>
                <button
                  onClick={() => {
                    if (!shippingValid) {
                      setError(
                        form.phone.length && form.phone.length !== 8
                          ? "El teléfono debe tener 8 dígitos."
                          : "Completa los campos marcados con *."
                      );
                      return;
                    }
                    setError(""); setView("payment");
                  }}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white font-black py-4 rounded-2xl transition"
                >
                  Elegir pago →
                </button>
              </div>
            )}
            {view === "payment" && (
              <div className="flex gap-3">
                <button onClick={() => setView("shipping")} className="px-5 py-4 rounded-2xl border border-slate-300 font-semibold hover:bg-slate-50">←</button>
                <button
                  onClick={confirmOrder}
                  disabled={processing}
                  className={
                    "flex-1 disabled:opacity-60 text-white font-black py-4 rounded-2xl transition " +
                    (isRedirect
                      ? "bg-brand-primary hover:bg-brand-primary-dark"
                      : "bg-green-500 hover:bg-green-600")
                  }
                >
                  {processing
                    ? "Procesando…"
                    : !selectedMethod
                    ? "Confirmar pedido"
                    : isRedirect
                    ? `Pagar ${money(totals.total)} →`
                    : "Confirmar por WhatsApp ✓"}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
