import fachada from "../../assets/about/Fachada.webp";
import mercancia1 from "../../assets/about/mercancia.webp";
import mercancia2 from "../../assets/about/mercancia2.webp";

export function AboutPage() {
  return (
    <div>
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img src={fachada} alt="Fachada de Textilindo" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/35 to-slate-900/10" />
        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col items-start justify-end pb-8">
          <h1 className="font-display font-semibold italic text-4xl md:text-6xl text-white tracking-tight">Acerca de Nosotros</h1>
          <p className="text-white/90 mt-2 max-w-xl">Conoce la historia detrás de Textilindo.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Quiénes somos</p>
            <h2 className="font-display font-semibold text-2xl md:text-3xl mt-1 tracking-tight">Nuestra historia</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio praesent
              libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum
              imperdiet.
            </p>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Duis sagittis ipsum, praesent mauris. Fusce nec tellus sed augue semper porta.
              Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad
              litora torquent per conubia nostra.
            </p>
          </div>
          <img
            loading="lazy"
            decoding="async"
            src={mercancia1}
            alt="Interior de la tienda Textilindo con rollos de tela"
            className="rounded-2xl w-full h-72 md:h-96 object-cover shadow-lg"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <img
            loading="lazy"
            decoding="async"
            src={mercancia2}
            alt="Mercancía y accesorios disponibles en Textilindo"
            className="rounded-2xl w-full h-72 md:h-96 object-cover shadow-lg"
          />
          <div>
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-wide">Lo que ofrecemos</p>
            <h2 className="font-display font-semibold text-2xl md:text-3xl mt-1 tracking-tight">Variedad para cada proyecto</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Curabitur sodales ligula in libero, sed dignissim lacinia nunc. Curabitur tortor.
              Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.
            </p>
            <p className="text-slate-600 mt-4 leading-relaxed">
              Maecenas mattis, sed convallis tristique sem. Proin ut ligula vel nunc egestas
              porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="#"
            className="inline-block bg-brand-primary hover:bg-brand-primary-dark text-white font-black px-8 py-4 rounded-2xl transition"
          >
            Ver catálogo →
          </a>
        </div>
      </div>
    </div>
  );
}
