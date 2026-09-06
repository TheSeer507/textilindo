import { Fragment } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import logo from "../../assets/textilindologo.jpg";
import { CONFIG, CONTACT, SOCIAL } from "../../config/store";
import { buildChatLink } from "../../utils/whatsapp";
import {
  InstagramGlyph, FacebookGlyph, TikTokGlyph, YouTubeGlyph, XGlyph,
} from "../icons/SocialGlyphs";

/* Orden en que salen las redes. Cada una se dibuja solo si tiene URL
   en CONFIG, así que el pie nunca muestra un enlace roto mientras se
   consiguen los datos. */
const NETWORKS = [
  { key: "instagram", label: "Instagram", Icon: InstagramGlyph },
  { key: "facebook",  label: "Facebook",  Icon: FacebookGlyph },
  { key: "tiktok",    label: "TikTok",    Icon: TikTokGlyph },
  { key: "youtube",   label: "YouTube",   Icon: YouTubeGlyph },
  { key: "x",         label: "X",         Icon: XGlyph },
];

export function Footer() {
  const networks = NETWORKS.filter((n) => SOCIAL[n.key]);
  const hasContact =
    CONTACT.supportEmail || CONTACT.salesEmail || CONTACT.address || CONTACT.hours?.length;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {/* ---- Marca ---- */}
        <div>
          <div className="inline-block bg-white rounded-xl px-4 py-2">
            <img src={logo} alt="Textilindo" className="h-8 w-auto" loading="lazy" decoding="async" />
          </div>
          <p className="text-sm text-slate-400 mt-4 max-w-xs leading-relaxed">
            Tu tienda de telas, hilos y textiles de confianza en Panamá.
          </p>

          {networks.length > 0 && (
            <div className="flex items-center gap-2 mt-6">
              {networks.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={SOCIAL[key]}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${CONFIG.storeName} en ${label}`}
                  title={label}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-700 text-slate-400 hover:text-slate-900 hover:bg-brand-accent hover:border-brand-accent transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* ---- Contáctanos ---- */}
        {hasContact && (
          <div>
            <p className="font-display font-semibold text-white">Contáctanos</p>
            <div className="mt-4 space-y-3 text-sm">
              {CONTACT.supportEmail && (
                <ContactRow icon={Mail} label="Para soporte">
                  <a href={`mailto:${CONTACT.supportEmail}`} className="text-brand-accent hover:underline break-all">
                    {CONTACT.supportEmail}
                  </a>
                </ContactRow>
              )}
              {CONTACT.salesEmail && (
                <ContactRow icon={Mail} label="Para ventas">
                  <a href={`mailto:${CONTACT.salesEmail}`} className="text-brand-accent hover:underline break-all">
                    {CONTACT.salesEmail}
                  </a>
                </ContactRow>
              )}
              {CONTACT.address && (
                <ContactRow icon={MapPin}>
                  <span className="text-slate-400">{CONTACT.address}</span>
                </ContactRow>
              )}
              {CONTACT.hours?.length > 0 && (
                <ContactRow icon={Clock}>
                  {/* Los días alineados en su propia columna: leído de un
                      vistazo, "¿abren el sábado?" se responde solo. */}
                  <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-slate-400">
                    {CONTACT.hours.map(({ days, time }) => (
                      <Fragment key={days}>
                        <span className="text-slate-300 whitespace-nowrap">{days}</span>
                        <span className="tabular-nums">{time}</span>
                      </Fragment>
                    ))}
                  </span>
                </ContactRow>
              )}
            </div>
          </div>
        )}

        {/* ---- Enlaces ---- */}
        <div className="lg:text-right">
          <p className="font-display font-semibold text-white">Enlaces</p>
          <div className="mt-4 flex flex-col gap-2 text-sm lg:items-end">
            <a href="#about" className="hover:text-brand-accent transition-colors">Acerca de Nosotros</a>
            <a
              href={buildChatLink()}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-accent transition-colors"
            >
              Ventas y soporte por WhatsApp
            </a>
            <a href="#cuenta" className="hover:text-brand-accent transition-colors">Mi cuenta</a>
            <a href="#admin" className="text-slate-600 hover:text-brand-accent transition-colors" aria-label="Panel interno">·</a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {CONFIG.storeName} · Colón, Panamá
      </div>
    </footer>
  );
}

function ContactRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-2.5">
      <Icon size={15} strokeWidth={2} className="text-slate-500 shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        {label && <span className="text-slate-300">{label}: </span>}
        {children}
      </p>
    </div>
  );
}
