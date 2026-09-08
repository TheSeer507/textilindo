import { CheckCircle2, Clock } from "lucide-react";

/* ==============================================================
   REGRESO DESDE LA PASARELA  (#pago)
   Aquí cae el cliente cuando PagueloFacil lo devuelve.

   Esta pantalla NO decide si el pago se hizo: el estado real lo
   marca el webhook, servidor a servidor. El cliente puede cerrar
   la pestaña antes de volver, o editar la URL a mano — creerle a
   lo que traiga sería dar por pagado lo que no lo está.

   Por eso el texto es deliberadamente prudente y manda al pedido,
   que sí refleja el estado verdadero.
============================================================== */
export function PaymentResult({ signedIn }) {
  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <CheckCircle2 size={34} strokeWidth={2} />
      </div>

      <h1 className="font-display font-semibold text-3xl tracking-tight mt-5">
        ¡Gracias por tu compra!
      </h1>

      <p className="text-slate-600 mt-3 leading-relaxed">
        Terminamos de procesar tu pago. En cuanto el banco lo confirme, tu
        pedido cambia a <strong>Pagado</strong> y comenzamos a prepararlo.
      </p>

      <p className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-5 bg-white rounded-2xl px-5 py-4">
        <Clock size={16} strokeWidth={2} className="shrink-0 text-slate-400" />
        La confirmación puede tardar un par de minutos.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        {signedIn && (
          <a
            href="#cuenta"
            className="bg-brand-primary hover:bg-brand-primary-dark text-white font-black px-6 py-3.5 rounded-2xl transition-colors"
          >
            Ver mi pedido
          </a>
        )}
        <a
          href="#"
          className="font-semibold border border-slate-300 rounded-2xl px-6 py-3.5 hover:bg-white transition-colors"
        >
          Volver al catálogo
        </a>
      </div>

      {!signedIn && (
        <p className="text-sm text-slate-500 mt-6">
          Te escribiremos por WhatsApp para coordinar la entrega.
        </p>
      )}
    </div>
  );
}
