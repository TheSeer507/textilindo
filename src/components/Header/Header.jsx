import { Truck, ShoppingBag, UserRound, LayoutDashboard } from "lucide-react";
import logo from "../../assets/textilindologo.jpg";
import { CONFIG, money } from "../../config/store";

export function Header({ count, onOpenCart, bumpKey, auth }) {
  // Nombre corto: en móvil no cabe "Ana María Rodríguez" al lado del carrito.
  const firstName = auth?.profile?.full_name?.trim().split(/\s+/)[0];
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
        <p className="hidden lg:flex items-center gap-1.5 text-sm text-slate-500 font-medium">
          <Truck size={16} strokeWidth={2} /> Envío gratis en pedidos sobre {money(CONFIG.freeShippingOver)}
        </p>

        <div className="flex items-center gap-2">
          {/* Acceso al panel: solo se dibuja para empleados y admin. */}
          {auth?.isStaff && (
            <a
              href="#admin"
              title="Panel interno"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-primary border border-slate-200 rounded-full px-3 py-2 transition-colors"
            >
              <LayoutDashboard size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Panel</span>
            </a>
          )}

          {auth?.user ? (
            <a
              href="#cuenta"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-primary border border-slate-200 rounded-full px-3 py-2 transition-colors max-w-[9rem]"
            >
              <UserRound size={16} strokeWidth={2} className="shrink-0" />
              <span className="truncate">{firstName || "Mi cuenta"}</span>
            </a>
          ) : (
            <a
              href="#login"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-primary border border-slate-200 rounded-full px-3 py-2 transition-colors"
            >
              <UserRound size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Entrar</span>
            </a>
          )}

          <button
            onClick={onOpenCart}
            aria-label="Abrir carrito"
            className="relative flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-primary-dark transition-colors"
          >
            <ShoppingBag size={16} strokeWidth={2} />
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              // `key` cambia con cada alta, lo que remonta el nodo y vuelve a
              // disparar la animación aunque se agregue el mismo producto.
              <span
                key={bumpKey}
                className="animate-cart-bump absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-accent text-brand-primary text-xs font-bold flex items-center justify-center"
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
