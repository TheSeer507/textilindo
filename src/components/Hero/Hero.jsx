import storeAisle from "../../assets/tienda/1000405877.jpg";

export function Hero() {
  return (
    <div className="relative h-[26rem] md:h-[34rem] overflow-hidden">
      <img
        src={storeAisle}
        alt="Pasillo de la tienda Textilindo con rollos de tela"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/35 to-slate-900/10" />
      <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-12 md:pb-16">
        <h1 className="font-display font-semibold italic text-4xl md:text-6xl text-white tracking-tight max-w-2xl leading-tight">
          Telas y textiles de calidad en Panamá
        </h1>
        <p className="text-white/90 mt-4 text-sm md:text-base max-w-md">
          Entrega 24–48 h en Ciudad de Panamá · Paga con Yappy o en efectivo al recibir.
        </p>
      </div>
    </div>
  );
}
