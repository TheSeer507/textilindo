import threads from "../../assets/tienda/1000276216.jpg";
import mola from "../../assets/tienda/1000488474.jpg";
import aisle from "../../assets/tienda/1000465554.jpg";

const FEATURES = [
  {
    img: threads,
    alt: "Pared de hilos y madejas de bordar de muchos colores",
    title: "Miles de colores e hilos",
    desc: "Hilos, madejas y accesorios de costura para cada proyecto, en toda la gama de colores que necesites.",
  },
  {
    img: mola,
    alt: "Molas kunas artesanales exhibidas en la tienda",
    title: "Arte textil panameño auténtico",
    desc: "Molas kunas hechas a mano — una pieza de la cultura de Panamá que no vas a encontrar en cualquier tienda.",
  },
  {
    img: aisle,
    alt: "Pasillo de la tienda con rollos de tela y vitrinas",
    title: "Todo para tu próximo proyecto",
    desc: "Desde la tela hasta el último accesorio — décadas de experiencia ayudando a nuestros clientes a encontrar justo lo que buscan.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest">Por qué elegirnos</p>
        <h2 className="font-display font-semibold text-3xl md:text-4xl mt-2 tracking-tight">
          La <span className="italic">variedad y calidad</span> de una tienda de toda la vida
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <img
              loading="lazy"
              decoding="async"
              src={f.img}
              alt={f.alt}
              className="rounded-2xl w-full h-56 object-cover shadow-md"
            />
            <h3 className="font-display font-semibold text-lg mt-5">{f.title}</h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
