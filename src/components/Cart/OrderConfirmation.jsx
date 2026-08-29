export function OrderConfirmation({ waLink }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 mx-auto rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-3xl">✓</div>
      <h4 className="font-black text-2xl mt-4 text-slate-900">¡Ya casi!</h4>
      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
        Abrimos WhatsApp con tu pedido completo. Envía el mensaje y te confirmamos la entrega en minutos.
      </p>
      {waLink && (
        <a href={waLink} target="_blank" rel="noreferrer" className="inline-block mt-6 text-sm font-semibold text-brand-primary underline">
          ¿No se abrió WhatsApp? Toca aquí
        </a>
      )}
    </div>
  );
}
