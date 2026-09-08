import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

/* ==============================================================
   REGRESO DESDE LA PASARELA  (#pago)

   Esta pantalla NO decide si se pagó. Lo que trae la URL lo puede
   escribir cualquiera; quien decide es el servidor. Aquí solo se
   le pregunta y se muestra la respuesta.

   Tres desenlaces:
     paid      → confirmado, se puede celebrar
     pending   → llegó de vuelta pero aún sin confirmar
     error     → ni siquiera se pudo preguntar
============================================================== */

/** Lee los parámetros que PagueloFacil agrega al volver. */
function readReturnParams() {
  // Con enrutado por hash la URL queda "#pago?order=..&Estado=..",
  // así que los parámetros van después del "?" dentro del hash, y
  // a veces también en el query normal.
  const hash = window.location.hash;
  const fromHash = new URLSearchParams(hash.slice(hash.indexOf("?") + 1));
  const fromQuery = new URLSearchParams(window.location.search);
  const get = (k) => fromHash.get(k) ?? fromQuery.get(k);
  return {
    orderId: get("order"),
    oper: get("Oper") ?? get("oper"),
    estado: get("Estado") ?? get("estado") ?? "",
  };
}

export function PaymentResult({ signedIn }) {
  /* El estado inicial sale de la URL en el primer render: si no hay
     pedido que consultar, arrancar en "checking" mostraría un spinner
     que nunca termina. */
  const [state, setState] = useState(() =>
    readReturnParams().orderId ? "checking" : "pending"
  ); // checking | paid | pending | error
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    const { orderId, oper, estado } = readReturnParams();
    if (!orderId) return;

    let active = true;
    (async () => {
      const { data, error } = await supabase.functions.invoke("paguelofacil-verify", {
        body: { orderId, oper, estado },
      });
      if (!active) return;
      if (error) return setState("error");
      setOrderNumber(data?.orderNumber ?? null);
      setState(data?.status === "paid" ? "paid" : "pending");
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24 text-center">
      {state === "checking" ? (
        <>
          <Loader2 size={40} className="mx-auto text-slate-400 animate-spin" />
          <h1 className="font-display font-semibold text-2xl tracking-tight mt-5">
            Verificando tu pago…
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Un momento, por favor.</p>
        </>
      ) : state === "paid" ? (
        <>
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={34} strokeWidth={2} />
          </div>
          <h1 className="font-display font-semibold text-3xl tracking-tight mt-5">
            ¡Pago confirmado!
          </h1>
          {orderNumber && (
            <p className="mt-3 font-black text-xl text-brand-primary tabular-nums">
              Pedido #{orderNumber}
            </p>
          )}
          <p className="text-slate-600 mt-3 leading-relaxed">
            Ya estamos preparando tu pedido. Te escribimos por WhatsApp para
            coordinar la entrega.
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock size={32} strokeWidth={2} />
          </div>
          <h1 className="font-display font-semibold text-3xl tracking-tight mt-5">
            {state === "error" ? "Recibimos tu pedido" : "Estamos confirmando tu pago"}
          </h1>
          {orderNumber && (
            <p className="mt-3 font-black text-xl text-brand-primary tabular-nums">
              Pedido #{orderNumber}
            </p>
          )}
          {/* Sin confirmación del banco no se promete nada: es peor decir
              "pagado" y luego desdecirse que pedir unos minutos. */}
          <p className="text-slate-600 mt-3 leading-relaxed">
            Tu pedido quedó registrado. En cuanto el banco confirme el pago lo
            verás como <strong>Pagado</strong>. Si algo no cuadra, te
            escribimos por WhatsApp.
          </p>
        </>
      )}

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

      {!signedIn && state !== "checking" && (
        <p className="text-sm text-slate-500 mt-6">
          <a href="#login" className="font-bold text-brand-primary hover:underline">
            Crea tu cuenta
          </a>{" "}
          para seguir este pedido y que la próxima compra sea más rápida.
        </p>
      )}
    </div>
  );
}
