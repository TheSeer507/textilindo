export function OrderConfirmation({ waLink, orderNumber }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 mx-auto rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-3xl">✓</div>
      <h4 className="font-black text-2xl mt-4 text-slate-900">¡Ya casi!</h4>

      {orderNumber && (
        <p className="mt-3 inline-block bg-brand-surface border border-brand-primary/30 rounded-xl px-4 py-2">
          <span className="text-xs text-slate-500 block">Tu número de pedido</span>
          <span className="font-black text-xl text-brand-primary tabular-nums">#{orderNumber}</span>
        </p>
      )}

      <p className="text-sm text-slate-500 mt-4 max-w-xs mx-auto">
        Abrimos WhatsApp con tu pedido completo. Envía el mensaje y te
        confirmamos la entrega en minutos.
      </p>

      {waLink && (
        <a href={waLink} target="_blank" rel="noreferrer" className="inline-block mt-6 text-sm font-semibold text-brand-primary underline">
          ¿No se abrió WhatsApp? Toca aquí
        </a>
      )}

      {orderNumber && (
        <p className="text-xs text-slate-400 mt-6">
          Puedes seguir tu pedido en{" "}
          <a href="#cuenta" className="font-semibold text-brand-primary hover:underline">Mi cuenta</a>.
        </p>
      )}
    </div>
  );
}
