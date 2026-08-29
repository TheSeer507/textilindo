import { CATEGORIES } from "../../data/products";

export function CategoryChips({ active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={
            "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition " +
            (active === c
              ? "bg-slate-900 text-white"
              : "bg-white border border-slate-300 text-slate-600 hover:border-slate-400")
          }
        >
          {c}
        </button>
      ))}
    </div>
  );
}
