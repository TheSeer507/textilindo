import { Truck, ShoppingBag } from "lucide-react";
import logo from "../../assets/textilindologo.jpg";
import { CONFIG, money } from "../../config/store";

export function Header({ count, onOpenCart }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200" style={{ backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.94)" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center">
            <img src={logo} alt="Textilindo" className="h-12 w-auto" />
          </a>
          <a href="#about" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-brand-primary">
            Nosotros
          </a>
        </div>
        <p className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 font-medium">
          <Truck size={16} strokeWidth={2} /> Envío gratis en pedidos sobre {money(CONFIG.freeShippingOver)}
        </p>
        <button onClick={onOpenCart} className="relative flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-primary-dark transition-colors">
          <ShoppingBag size={16} strokeWidth={2} /> Carrito
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-accent text-brand-primary text-xs font-bold flex items-center justify-center">{count}</span>
          )}
        </button>
      </div>
    </header>
  );
}
