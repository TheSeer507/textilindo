import mantelVinil from "../assets/tienda/1000305752.jpg";
import telaCortinas from "../assets/tienda/1000305753.jpg";
import telaSaten from "../assets/tienda/1000305759.jpg";
import rollosTextilindo from "../assets/tienda/1000305760.jpg";
import hiloBordar1 from "../assets/tienda/1000276216.jpg";
import hiloBordar2 from "../assets/tienda/1000453658.webp";
import hiloCostura from "../assets/tienda/1000276221.jpg";
import cintasAdornos from "../assets/tienda/1000499400.jpg";
import molaKuna from "../assets/tienda/1000488474.jpg";
import bolsosCarteras from "../assets/about/mercancia2.webp";
import souvenirs from "../assets/tienda/1000379115.jpg";

/* ==============================================================
   PRODUCT CATALOG
   Add/remove products here — the whole UI adapts.
   `cost`, `weightKg`, `shipPerKg`, `tariffPct` feed the admin margins table.
   `stock` is the units on hand — 0 shows "Agotado" and blocks add-to-cart,
   ≤5 shows a "¡Quedan N!" hint. Edit it as inventory changes.
   `images` is an array of photo URLs shown as a gallery in the product's
   page (and the first one as the catalog card cover) — real photos of the
   store's actual merchandise, imported from src/assets/tienda/ and
   src/assets/about/ like the logo/banner. Add more the same way: drop a
   file in assets, `import` it above, reference it here.
============================================================== */
export const PRODUCTS = [
  {
    id: "mantel-vinil",
    name: "Mantel de vinil estampado",
    category: "Hogar",
    price: 1.25, compareAt: 1.75,
    badge: "Oferta",
    emoji: "🍽️",
    bg: "linear-gradient(135deg,#f59e0b,#b45309)",
    desc: "Mantel de vinil resistente al agua con estampados frutales y florales. Fácil de limpiar, ideal para el hogar.",
    cost: 0.45, weightKg: 0.25, shipPerKg: 8, tariffPct: 7,
    stock: 45,
    images: [mantelVinil],
  },
  {
    id: "tela-cortinas",
    name: "Tela decorativa para cortinas",
    category: "Telas",
    price: 5.95, compareAt: 7.95,
    badge: "Nuevo",
    emoji: "🪟",
    bg: "linear-gradient(135deg,#475569,#1e293b)",
    desc: "Tela decorativa de alta calidad para cortinas y tapicería, en variedad de estampados y texturas.",
    cost: 2.4, weightKg: 0.4, shipPerKg: 8, tariffPct: 7,
    stock: 30,
    images: [telaCortinas],
  },
  {
    id: "tela-saten",
    name: "Tela de satín y organza",
    category: "Telas",
    price: 2.95, compareAt: 3.95,
    badge: null,
    emoji: "✨",
    bg: "linear-gradient(135deg,#a855f7,#6d28d9)",
    desc: "Satín y organza brillante en más de 20 colores. Perfecta para decoración, moños y trajes.",
    cost: 1.1, weightKg: 0.25, shipPerKg: 8, tariffPct: 7,
    stock: 4,
    images: [telaSaten],
  },
  {
    id: "rollos-textilindo",
    name: "Rollos de tela Textilindo",
    category: "Telas",
    price: 4.95, compareAt: 6.95,
    badge: "Más vendido",
    emoji: "🧵",
    bg: "linear-gradient(135deg,#0f766e,#134e4a)",
    desc: "Nuestra selección insignia de rollos de tela — algodón, franela y estampados exclusivos Textilindo.",
    cost: 2.0, weightKg: 0.4, shipPerKg: 8, tariffPct: 7,
    stock: 60,
    images: [rollosTextilindo],
  },
  {
    id: "hilo-bordar",
    name: "Hilo de bordar multicolor",
    category: "Hilos",
    price: 1.25, compareAt: 1.75,
    badge: null,
    emoji: "🧶",
    bg: "linear-gradient(135deg,#db2777,#831843)",
    desc: "Hilos de bordar en más de 100 colores, ideales para bordado a mano, macramé y manualidades.",
    cost: 0.35, weightKg: 0.02, shipPerKg: 8, tariffPct: 7,
    stock: 200,
    images: [hiloBordar1, hiloBordar2],
  },
  {
    id: "hilo-costura",
    name: "Hilo de coser y mercería",
    category: "Mercería",
    price: 2.50, compareAt: 3.50,
    badge: null,
    emoji: "🪡",
    bg: "linear-gradient(135deg,#0ea5e9,#0369a1)",
    desc: "Hilo de coser resistente para máquina y mano, además de tijeras y accesorios de mercería.",
    cost: 0.9, weightKg: 0.14, shipPerKg: 8, tariffPct: 7,
    stock: 80,
    images: [hiloCostura],
  },
  {
    id: "cintas-adornos",
    name: "Cintas y adornos decorativos",
    category: "Mercería",
    price: 1.75, compareAt: 2.50,
    badge: "Oferta",
    emoji: "🎀",
    bg: "linear-gradient(135deg,#ef4444,#991b1b)",
    desc: "Cintas decorativas de todos los colores y anchos, perfectas para regalos, moños y manualidades.",
    cost: 0.55, weightKg: 0.05, shipPerKg: 8, tariffPct: 7,
    stock: 0,
    images: [cintasAdornos],
  },
  {
    id: "mola-kuna",
    name: "Mola kuna artesanal",
    category: "Arte Textil",
    price: 28.00, compareAt: 38.00,
    badge: "Nuevo",
    emoji: "🎨",
    bg: "linear-gradient(135deg,#dc2626,#facc15)",
    desc: "Mola hecha a mano por artesanas kunas — auténtico arte textil panameño, cada pieza es única.",
    cost: 12.0, weightKg: 0.1, shipPerKg: 8, tariffPct: 7,
    stock: 12,
    images: [molaKuna],
  },
  {
    id: "bolsos-carteras",
    name: "Bolsos y carteras de moda",
    category: "Accesorios",
    price: 15.99, compareAt: 22.99,
    badge: null,
    emoji: "👜",
    bg: "linear-gradient(135deg,#78350f,#451a03)",
    desc: "Bolsos y carteras de moda en distintos estilos y colores, para complementar tu look.",
    cost: 6.5, weightKg: 0.5, shipPerKg: 8, tariffPct: 7,
    stock: 18,
    images: [bolsosCarteras],
  },
  {
    id: "souvenirs-artesanales",
    name: "Llaveros y souvenirs artesanales",
    category: "Accesorios",
    price: 3.50, compareAt: 5.00,
    badge: "Oferta",
    emoji: "🔑",
    bg: "linear-gradient(135deg,#f59e0b,#78350f)",
    desc: "Llaveros y souvenirs artesanales panameños — el recuerdo perfecto de tu visita.",
    cost: 1.1, weightKg: 0.03, shipPerKg: 8, tariffPct: 7,
    stock: 60,
    images: [souvenirs],
  },
];

export const CATEGORIES = ["Todos", ...new Set(PRODUCTS.map((p) => p.category))];

export const LOW_STOCK_THRESHOLD = 5;
