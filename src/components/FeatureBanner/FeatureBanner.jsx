import ribbons from "../../assets/tienda/1000499400.jpg";

export function FeatureBanner() {
  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      <img
        loading="lazy"
        decoding="async"
        src={ribbons}
        alt="Pared de cintas y telas de colores en Textilindo"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/40" />
      <div className="relative h-full flex items-center justify-center px-4">
        <p className="font-display font-semibold italic text-2xl md:text-4xl text-white text-center max-w-xl">
          Color, textura y tradición en cada rincón de la tienda
        </p>
      </div>
    </div>
  );
}
