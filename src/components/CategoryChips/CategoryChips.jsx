import { CATEGORIES } from "../../data/products";

/* ==============================================================
   FILTRO DE CATEGORÍAS
   Con el inventario real son 18 pastillas, y una sola fila ya no
   alcanza. Se resuelve distinto según la pantalla:

   - Escritorio: se acomodan en varias filas, todas a la vista.
   - Móvil: una fila que se desliza con el dedo. Apiladas ocuparían
     media pantalla antes del primer producto. La fila llega hasta
     el borde y se desvanece a la derecha, que es la pista de que
     hay más por deslizar.
============================================================== */
export function CategoryChips({ active, onSelect }) {
  return (
    <div className="relative">
      <div
        className="
          flex gap-2 pb-1
          overflow-x-auto -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0
        "
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            aria-pressed={active === c}
            className={
              "shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition " +
              (active === c
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-300 text-slate-600 hover:border-slate-400")
            }
          >
            {c}
          </button>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="sm:hidden pointer-events-none absolute -right-4 top-0 bottom-1 w-10 bg-gradient-to-l from-brand-surface to-transparent"
      />
    </div>
  );
}
