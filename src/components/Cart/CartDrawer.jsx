import { useState, useMemo } from "react";
import { CONFIG, money } from "../../config/store";
import { PAYMENT_METHODS } from "../../data/paymentMethods";
import { buildWhatsAppLink } from "../../utils/whatsapp";
import { CartItemsView } from "./CartItemsView";
import { ShippingForm } from "./ShippingForm";
import { PaymentMethods } from "./PaymentMethods";
import { OrderConfirmation } from "./OrderConfirmation";

const emptyForm = { name: "", phone: "", province: "", city: "", notes: "" };

export function CartDrawer({ open, onClose, cart, products, changeQty, removeItem }) {
  // view: "cart" → "shipping" → "payment" → "done"
  const [view, setView] = useState("cart");
  const [form, setForm] = useState(emptyForm);
  const [payMethod, setPayMethod] = useState(null);
  const [error, setError] = useState("");
  const [waLink, setWaLink] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Reset the wizard back to "cart" whenever the drawer transitions to open —
  // done during render (React's documented pattern for "adjust state when a
  // prop changes") instead of an effect, so it doesn't cause an extra commit.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) { setView("cart"); setError(""); }
  }

  const items = useMemo(
    () => Object.entries(cart)
      .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
      .filter((i) => i.product),
    [cart, products]
  );

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= CONFIG.freeShippingOver ? 0 : CONFIG.shippingFlat;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [items]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const shippingValid = form.name.trim() && form.phone.trim() && form.province && form.city.trim();

  const confirmOrder = async () => {
    const method = PAYMENT_METHODS.find((m) => m.id === payMethod);
    if (!method) { setError("Elige un método de pago para confirmar."); return; }

    // Claim the tab synchronously, while we are still inside the click.
    // `await` below ends the user-gesture window, and mobile Safari blocks
    // any window.open() made after that point — so open first, aim later.
    const tab = window.open("", "_blank");

    setProcessing(true);
    const result = await method.process({ items, form, totals });
    setProcessing(false);
    if (!result.ok) {
      tab?.close();
      setError(result.error || "No se pudo procesar el pago.");
      return;
    }

    // Today every enabled method confirms via WhatsApp.
    // An online gateway would instead redirect: tab.location.href = result.paymentUrl
    const link = buildWhatsAppLink(items, form, payMethod, totals);
    setWaLink(link);
    if (tab) tab.location.href = link;
    else window.location.href = link; // popup blocked — go in this tab instead
    setView("done");
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
          {view === "shipping" && <ShippingForm form={form} set={set} error={error} />}
          {view === "payment" && (
            <PaymentMethods payMethod={payMethod} setPayMethod={setPayMethod} setError={setError} error={error} />
          )}
          {view === "done" && <OrderConfirmation waLink={waLink} />}
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
                  onClick={() => { if (!shippingValid) { setError("Completa los campos marcados con *."); return; } setError(""); setView("payment"); }}
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
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-black py-4 rounded-2xl transition"
                >
                  {processing ? "Procesando…" : "Confirmar por WhatsApp ✓"}
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
