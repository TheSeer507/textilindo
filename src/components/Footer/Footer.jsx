import logo from "../../assets/textilindologo.jpg";
import { CONFIG } from "../../config/store";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-2 gap-10">
        <div>
          <div className="inline-block bg-white rounded-xl px-4 py-2">
            <img src={logo} alt="Textilindo" className="h-8 w-auto" />
          </div>
          <p className="text-sm text-slate-400 mt-4 max-w-xs leading-relaxed">
            Tu tienda de telas, hilos y textiles de confianza en Panamá.
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-display font-semibold text-white">Enlaces</p>
          <div className="mt-3 flex flex-col gap-1 text-sm sm:items-end">
            <a href="#about" className="hover:text-brand-accent transition-colors">Acerca de Nosotros</a>
            <p className="text-slate-400">
              Ventas y soporte por WhatsApp · <a href="#admin" className="hover:text-brand-accent">·</a>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © 2026 {CONFIG.storeName} Panamá · Ciudad de Panamá
      </div>
    </footer>
  );
}
