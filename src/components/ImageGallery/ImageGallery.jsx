import { useState, useRef, useEffect } from "react";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

const ZOOM_SCALE = 2.5;

export function ImageGallery({ images, alt }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgBoxRef = useRef(null);
  const readyRef = useRef(false);
  const hideTimerRef = useRef(null);

  const go = (delta) => setIndex((i) => (i + delta + images.length) % images.length);

  // Some browsers re-evaluate :hover after a layout change even without real
  // mouse movement (e.g. navigating to this page via a click, or images
  // finishing loading, can leave the cursor sitting over where the image
  // now renders). Two defenses: ignore hover briefly after mount, and only
  // keep the zoom pane open while genuine mousemove keeps arriving — any
  // one-off phantom event self-clears within HOVER_EXPIRY_MS instead of
  // getting stuck open over the buy button.
  useEffect(() => {
    const t = setTimeout(() => { readyRef.current = true; }, 200);
    return () => { clearTimeout(t); clearTimeout(hideTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length]);

  const HOVER_EXPIRY_MS = 300;

  const handleMouseMove = (e) => {
    if (!readyRef.current) return;
    const rect = imgBoxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setHovering(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setHovering(false), HOVER_EXPIRY_MS);
  };

  const handleMouseLeave = () => {
    clearTimeout(hideTimerRef.current);
    setHovering(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={imgBoxRef}
          className="relative aspect-square bg-slate-100 overflow-hidden rounded-xl cursor-zoom-in"
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
        >
          <img src={images[index]} alt={`${alt} — foto ${index + 1}`} className="w-full h-full object-cover" fetchPriority="high" decoding="async" />

          <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-700 pointer-events-none">
            <ZoomIn size={18} strokeWidth={2} />
          </span>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-lg text-slate-900"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-lg text-slate-900"
              >
                ›
              </button>
              <span className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                {index + 1}/{images.length}
              </span>
            </>
          )}
        </div>

        {hovering && (
          <div className="hidden lg:block absolute top-0 left-full ml-4 w-full aspect-square rounded-xl overflow-hidden shadow-xl border border-slate-200 bg-white z-20 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${images[index]})`,
                backgroundSize: `${ZOOM_SCALE * 100}%`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 sm:px-6 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={
                "w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition " +
                (i === index ? "border-brand-primary" : "border-transparent opacity-60 hover:opacity-100")
              }
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X size={22} />
          </button>
          <img
            src={images[index]}
            alt={`${alt} — foto ${index + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Foto siguiente"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <ChevronRight size={24} />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {index + 1}/{images.length}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
