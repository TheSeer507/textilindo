import { photos } from "./catalogPhotos";
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
   CATÁLOGO
   Agrega o quita productos aquí — toda la tienda se adapta, y las
   categorías salen solas de lo que diga cada `category`.

   Hay dos generaciones de productos en el mismo arreglo:

   1. INVENTARIO REAL (los `item(...)` de arriba). Vienen de las
      fotos que mandó la tienda: la carpeta es la categoría y el
      rótulo de cada foto es el producto. Sus fotos se enlazan solas
      desde src/assets/catalogo/<id>/ (ver catalogPhotos.js).

      Casi todos van SIN `price`: la tienda todavía no entrega la
      lista de precios, y un precio inventado en una tienda que ya
      recibe pedidos es peor que no mostrar ninguno. Sin precio, el
      producto sale como "Precio a consultar" y su botón abre
      WhatsApp en vez del carrito. El día que llegue el precio basta
      con agregarlo:

        item("organza", "Organza", "Organza", "…", { price: 2.95 })

      y el producto pasa a venderse por el carrito como cualquiera.
      Campos opcionales del mismo modo: `stock`, `compareAt`, `badge`,
      `cost` (este último lo usa la tabla de márgenes del panel).

   2. PRODUCTOS DE MUESTRA (los objetos largos de abajo). Son los que
      se armaron mientras llegaba el inventario; sus precios, costos
      y existencias son de relleno.

   `stock` es opcional: 0 muestra "Agotado" y bloquea el carrito,
   ≤5 muestra "¡Quedan N!"; si no se pone, no se controla.
============================================================== */

/** Producto del inventario real. `id` debe coincidir con su carpeta de fotos. */
const item = (id, name, category, desc, extra) => ({ id, name, category, desc, ...photos(id), ...extra });

export const PRODUCTS = [
  // ---------------- Algodón ----------------
  item(
    "algodon", "Algodón", "Algodón",
    "Tela de algodón estampada en gran variedad de diseños: florales, cuadros, rayas y motivos geométricos. Fresca y fácil de coser, ideal para vestidos, blusas, camisas y manualidades."
  ),

  // ---------------- Tela de vestidos ----------------
  item(
    "satin", "Satín", "Tela de vestidos",
    "Satín liso de brillo intenso y tacto sedoso, en gran variedad de colores. Para vestidos de fiesta, forros, lazos, manteles y decoración de eventos."
  ),
  item(
    "crepe-satinado", "Crepe satinado", "Tela de vestidos",
    "Crepe de acabado satinado, con brillo suave y muy buena caída. En colores como rojo, vino, blanco y champán. Para vestidos de fiesta, blusas y faldas."
  ),
  item(
    "poplin", "Poplin", "Tela de vestidos",
    "Poplin liso, fresco y de tacto suave, en colores vivos y pasteles: morado, verde, amarillo claro, azul, lila y fucsia. Para vestidos, blusas, camisas y forros."
  ),
  // "Scall" y "Sutin" van escritos tal como los rotuló la tienda.
  item(
    "scall", "Scall", "Tela de vestidos",
    "Tela lisa para vestidos, de tejido fino y cuerpo ligero. En colores como amarillo, rojo, azul marino, azul rey, vino, naranja y crema."
  ),
  item(
    "sutin", "Sutin", "Tela de vestidos",
    "Tela lisa para vestidos, de acabado mate y tacto suave. En colores como lila, blanco, rojo, amarillo, verde, azul rey, menta y azul marino."
  ),
  item(
    "tela-de-cuadritos", "Tela de cuadritos", "Tela de vestidos",
    "Tela de cuadritos tipo vichy en muchos colores: naranja, rojo, azul, verde, amarillo, rosado, morado y más. Un clásico para vestidos, blusas, delantales y manteles."
  ),

  // ---------------- Chifón ----------------
  item(
    "chifon", "Chifón", "Chifón",
    "Chifón liso, liviano y semitransparente, de caída vaporosa. En colores como crema, verde limón, coral, azul, fucsia y rosado. Para vestidos, blusas, pañuelos y sobrefaldas."
  ),
  item(
    "chifon-estampado-lentejuelas", "Chifón estampado con lentejuelas", "Chifón",
    "Chifón liviano con estampados florales y pequeñas lentejuelas que le dan brillo. Varios diseños y colores, para vestidos, blusas y prendas de fiesta."
  ),

  // ---------------- Una tela por categoría ----------------
  item(
    "organza", "Organza", "Organza",
    "Organza de brillo tornasolado y cuerpo firme, en colores como naranja, rojo, azul, gris y cobre. Para vestidos de fiesta, sobrefaldas, lazos y decoración de eventos."
  ),
  item(
    "tull", "Tull", "Tull",
    "Tull liviano en colores vivos y neón, y también con brillo escarchado. Para tutús, velos, vestidos de fiesta, lazos y decoración."
  ),
  item(
    "encaje", "Encaje", "Encaje",
    "Tela de encaje con diseño floral, en colores como turquesa, verde, naranja, fucsia, beige y azul. Para vestidos, blusas, sobrefaldas y detalles de costura."
  ),
  item(
    "tela-para-toalla", "Tela para toalla", "Tela para toalla",
    "Tela de toalla suave y absorbente, en blanco, rosado y rojo. Para toallas, batas, baberos y artículos de bebé."
  ),
  item(
    "tela-para-sueter", "Tela para suéter", "Tela para suéter",
    "Tela de punto para confeccionar suéteres y camisetas. En colores como verde, turquesa, mostaza, azul marino y coral."
  ),
  item(
    "tela-tapiz", "Tela tapiz", "Tela tapiz",
    "Tela de tapicería gruesa y resistente, con diseños geométricos en varios colores. Para tapizar muebles, cojines, cortinas y proyectos de decoración."
  ),
  item(
    "telas-navidenas", "Telas navideñas", "Telas navideñas",
    "Telas con estampados de Navidad: Santa Claus, flores de pascua, bastones de caramelo y más motivos festivos. Para manteles, caminos de mesa, cojines, botas y decoración de temporada."
  ),

  // ---------------- Tela para sabanillas ----------------
  item(
    "lanilla", "Lanilla", "Tela para sabanillas",
    "Lanilla suave y abrigada con estampados infantiles: animalitos, ballenas, lunares y más. Para sabanillas, pijamas y ropa de bebé."
  ),
  item(
    "frazadas", "Frazadas", "Tela para sabanillas",
    "Tela para frazadas, suave y abrigada, con estampados infantiles y de personajes. Para frazadas, mantas y cobijas de bebé."
  ),
  item(
    "panos-colcha-bebe", "Paños para colcha de bebés", "Tela para sabanillas",
    "Paños estampados para armar colchas de bebé, con ositos y motivos infantiles en tonos pastel. También hay tela acolchada en rollo."
  ),

  // ---------------- Hilos ----------------
  item(
    "hilos-de-tejer", "Hilos de tejer", "Hilos",
    "Hilos y estambres para tejer a crochet o a dos agujas, en decenas de colores: acrílicos, de algodón, matizados y para amigurumi. También agujas de crochet y de tejer."
  ),
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

  // ---------------- Sedería ----------------
  item(
    "encajes-y-puntillas", "Encajes y puntillas", "Sedería",
    "Encajes y puntillas blancas en tira, en distintos anchos y diseños. Para ribetear vestidos, blusas, manteles, cortinas y ropa de bebé."
  ),
  item(
    "colorante-mariposa", "Colorante para ropa Mariposa", "Sedería",
    "Colorante para ropa marca Mariposa, en cristales de color. Caja de 32 g. Colores: azul claro, azul marino, castaño oscuro y rojo escarlata, entre otros.",
    // Único precio real del lote: es el que marca la etiqueta de cada
    // caja en la foto (tomada el 3-sep-2026). Confirmar con la tienda.
    { price: 2.5 }
  ),
  item(
    "bolsas-de-regalo", "Bolsas de regalo de papel", "Sedería",
    "Bolsas de papel con asas para regalo, en varios tamaños y colores: kraft, blanco, negro, naranja, verde y más. Se venden por unidad o por docena."
  ),
  item(
    "papel-en-rollo", "Papel en rollo de colores", "Sedería",
    "Papel en rollo de colores lisos para envolver regalos, manualidades y decoración: negro, verde, azul, amarillo, gris, blanco, rojo, rosado y kraft."
  ),
  {
    id: "hilo-costura",
    name: "Hilo de coser y mercería",
    category: "Sedería",
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
    category: "Sedería",
    price: 1.75, compareAt: 2.50,
    badge: "Oferta",
    emoji: "🎀",
    bg: "linear-gradient(135deg,#ef4444,#991b1b)",
    desc: "Cintas decorativas de todos los colores y anchos, perfectas para regalos, moños y manualidades.",
    cost: 0.55, weightKg: 0.05, shipPerKg: 8, tariffPct: 7,
    stock: 0,
    images: [cintasAdornos],
  },

  // ================= Productos de muestra =================
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

/** ¿Tiene precio publicado? Sin precio, el producto se consulta por WhatsApp. */
export const hasPrice = (p) => typeof p?.price === "number";
