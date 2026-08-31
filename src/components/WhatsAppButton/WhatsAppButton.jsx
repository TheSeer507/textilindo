import { useState, useEffect } from "react";
import { buildChatLink } from "../../utils/whatsapp";
import { WhatsAppGlyph } from "../icons/WhatsAppGlyph";

/* ==============================================================
   FLOATING WHATSAPP BUTTON
   Sits bottom-right on every page and opens a fresh conversation
   with the store. Hidden while the cart drawer is open so it never
   sits on top of the checkout flow.

   It is a real <a>, not a button with window.open() — anchors are
   never caught by popup blockers, which matters on mobile Safari.
============================================================== */
export function WhatsAppButton({ hidden = false, productName }) {
  const [expanded, setExpanded] = useState(false);

  // Show the text label after a beat so it catches the eye once the
  // page has settled, then collapse to a circle to stay out of the way.
  useEffect(() => {
    const show = setTimeout(() => setExpanded(true), 1800);
    const hide = setTimeout(() => setExpanded(false), 6800);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <a
      href={buildChatLink({ productName })}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={`
        fixed z-30 flex items-center gap-3
        bottom-[calc(1.25rem+env(safe-area-inset-bottom))]
        right-[calc(1.25rem+env(safe-area-inset-right))]
        rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25
        hover:bg-[#1ebe5a] hover:scale-105 active:scale-95
        focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40
        transition-all duration-300
        ${expanded ? "pl-4 pr-5 py-3.5" : "p-3.5"}
        ${hidden ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}
      `}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <WhatsAppGlyph />
      <span
        className={`
          font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-300
          ${expanded ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"}
        `}
      >
        Escríbenos
      </span>
    </a>
  );
}
