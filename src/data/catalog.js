/* ==============================================================
   INVENTARIO REAL — artículos y precios

   Este archivo es la lista de lo que vende la tienda, tal como llega
   de ella: el nombre que le pone a cada tela y el precio que mandó.
   No importa nada (ni fotos ni librerías) a propósito: así lo leen
   por igual la tienda (src/data/products.js le pega las fotos) y el
   script que arma la base de datos (npm run catalog:sql).

   CÓMO SE ESCRIBE UN PRECIO
     price: 3.95            un solo precio
     (sin price)            "Precio a consultar": el botón abre WhatsApp
     options: [ … ]         varias presentaciones, cada una con su precio
                            (ancho, tipo…). Cada opción lleva un `id` que
                            no debe cambiar nunca: es su llave en la base
                            y lo que queda guardado en los pedidos.

   `unit` dice cómo se vende: "yarda" (todas las telas) o "unidad".
   En el carrito, la cantidad de una tela son yardas completas.

   OJO — DESPUÉS DE LA PRIMERA CARGA, EL PRECIO MANDA EN LA BASE
   La página muestra el precio de la base de datos (tabla
   product_variants), que se cambia desde el panel sin publicar nada.
   Lo de aquí es la carga inicial y el respaldo si la base no responde.
   Si cambias un precio aquí, cámbialo también en el panel.

   DE DÓNDE SALIÓ CADA PRECIO
   `source` apunta a la imagen de la lista de precios que mandó el CM
   de la tienda en octubre de 2026 (precios POR YARDA), guardada en
   fotos-originales/Fotos_con_Precios/. Cada imagen se emparejó con su
   collage original comparando los píxeles, no por el nombre.
============================================================== */

const LISTA_CM = (file) => `Lista de precios del CM, oct-2026 (Fotos_con_Precios/${file}.webp)`;

const ITEMS = [
  // ---------------- Algodón ----------------
  // La tienda rotuló las tres fotos solo como "Algodón", pero les puso
  // precio distinto. Los nombres de aquí describen los diseños de cada
  // foto para poder distinguirlas; se pueden cambiar por los que use
  // la tienda.
  {
    id: "algodon-estampado",
    name: "Algodón estampado",
    category: "Algodón",
    desc: "Tela de algodón estampada: flores, tulipanes, abanicos y rayas en tonos azules, lilas, rosados y amarillos. Fresca y fácil de coser, para vestidos, blusas y manualidades.",
    price: 4.95,
    source: LISTA_CM("1000162293"),
  },
  {
    id: "algodon-cuadros-rayas",
    name: "Algodón de cuadros y rayas",
    category: "Algodón",
    desc: "Tela de algodón en cuadros, rejillas y rayas —azul marino, negro, rojo y blanco— y diseños náuticos con anclas. Para camisas, vestidos, blusas y manualidades.",
    price: 6.95,
    source: LISTA_CM("1000162299"),
  },
  {
    // Su collage no vino en la lista de precios.
    id: "algodon-floral",
    name: "Algodón floral",
    category: "Algodón",
    desc: "Tela de algodón con flores grandes —rosas y peonías— sobre fondos amarillo, rojo, azul marino y rosado. Para vestidos, faldas, blusas y decoración.",
  },

  // ---------------- Tela de vestidos ----------------
  {
    id: "satin",
    name: "Satín",
    category: "Tela de vestidos",
    desc: "Satín liso de brillo intenso y tacto sedoso, en gran variedad de colores. Para vestidos de fiesta, forros, lazos, manteles y decoración de eventos.",
    price: 2.25,
    source: LISTA_CM("1000162287"),
  },
  {
    id: "crepe-satinado",
    name: "Crepe satinado",
    category: "Tela de vestidos",
    desc: "Crepe de acabado satinado, con brillo suave y muy buena caída. En colores como rojo, vino, blanco y champán. Para vestidos de fiesta, blusas y faldas.",
    price: 6.95,
    source: LISTA_CM("1000162297"),
  },
  {
    id: "poplin",
    name: "Poplin",
    category: "Tela de vestidos",
    desc: "Poplin liso, fresco y de tacto suave, en colores vivos y pasteles: morado, verde, amarillo claro, azul, lila y fucsia. Para vestidos, blusas, camisas y forros.",
  },
  {
    // "Scall" y "Sutin" van escritos tal como los rotuló la tienda.
    // La lista trae DOS precios para Scall (5.95 y 6.95) sin decir de qué
    // depende cada uno. Mientras no tengan rótulo, la página muestra el
    // rango y manda a WhatsApp; al ponerle `label` a cada opción (por
    // ejemplo el ancho) pasan a poder elegirse y comprarse en línea.
    id: "scall",
    name: "Scall",
    category: "Tela de vestidos",
    desc: "Tela lisa para vestidos, de tejido fino y cuerpo ligero. En colores como amarillo, rojo, azul marino, azul rey, vino, naranja y crema.",
    options: [
      { id: "scall-a", price: 5.95 },
      { id: "scall-b", price: 6.95 },
    ],
    source: LISTA_CM("1000162269"),
  },
  {
    id: "sutin",
    name: "Sutin",
    category: "Tela de vestidos",
    desc: "Tela lisa para vestidos, de acabado mate y tacto suave. En colores como lila, blanco, rojo, amarillo, verde, azul rey, menta y azul marino.",
    price: 2.95,
    source: LISTA_CM("1000162283"),
  },
  {
    id: "tela-de-cuadritos",
    name: "Tela de cuadritos",
    category: "Tela de vestidos",
    desc: "Tela de cuadritos tipo vichy en muchos colores: naranja, rojo, azul, verde, amarillo, rosado, morado y más. Un clásico para vestidos, blusas, delantales y manteles.",
  },

  // ---------------- Chifón ----------------
  {
    id: "chifon",
    name: "Chifón",
    category: "Chifón",
    desc: "Chifón liso, liviano y semitransparente, de caída vaporosa. En colores como crema, verde limón, coral, azul, fucsia y rosado. Para vestidos, blusas, pañuelos y sobrefaldas.",
    price: 3.95,
    source: LISTA_CM("1000162305"),
  },
  {
    id: "chifon-estampado-lentejuelas",
    name: "Chifón estampado con lentejuelas",
    category: "Chifón",
    desc: "Chifón liviano con estampados florales y pequeñas lentejuelas que le dan brillo. Varios diseños y colores, para vestidos, blusas y prendas de fiesta.",
    price: 4.95,
    source: LISTA_CM("1000162310"),
  },

  // ---------------- Una tela por categoría ----------------
  {
    // En la lista: 120" 3.95 · 60" 2.95 (el ancho de la tela, en pulgadas).
    id: "organza",
    name: "Organza",
    category: "Organza",
    desc: "Organza de brillo tornasolado y cuerpo firme, en colores como naranja, rojo, azul, gris y cobre. Viene en dos anchos: 60″ y 120″. Para vestidos de fiesta, sobrefaldas, lazos y decoración de eventos.",
    options: [
      { id: "organza-60", label: "60″ de ancho", price: 2.95 },
      { id: "organza-120", label: "120″ de ancho", price: 3.95 },
    ],
    source: LISTA_CM("1000162285"),
  },
  {
    id: "tull",
    name: "Tull",
    category: "Tull",
    desc: "Tull liviano en colores vivos y neón, y también con brillo escarchado. Para tutús, velos, vestidos de fiesta, lazos y decoración.",
    price: 3.95,
    source: LISTA_CM("1000162271"),
  },
  {
    // En la lista: "Encaje (Strech) 6.95 · Encaje 2.95".
    id: "encaje",
    name: "Encaje",
    category: "Encaje",
    desc: "Tela de encaje con diseño floral, en colores como turquesa, verde, naranja, fucsia, beige y azul. La hay normal y stretch (elástica). Para vestidos, blusas, sobrefaldas y detalles de costura.",
    options: [
      { id: "encaje-normal", label: "Normal", price: 2.95 },
      { id: "encaje-stretch", label: "Stretch", price: 6.95 },
    ],
    source: LISTA_CM("1000162295"),
  },
  {
    id: "tela-para-toalla",
    name: "Tela para toalla",
    category: "Tela para toalla",
    desc: "Tela de toalla suave y absorbente, en blanco, rosado y rojo. Para toallas, batas, baberos y artículos de bebé.",
    price: 18.95,
    source: LISTA_CM("1000162291"),
  },
  {
    id: "tela-para-sueter",
    name: "Tela para suéter",
    category: "Tela para suéter",
    desc: "Tela de punto para confeccionar suéteres y camisetas. En colores como verde, turquesa, mostaza, azul marino y coral.",
    price: 3.95,
    source: LISTA_CM("1000162301"),
  },
  {
    id: "tela-tapiz",
    name: "Tela tapiz",
    category: "Tela tapiz",
    desc: "Tela de tapicería gruesa y resistente, con diseños geométricos en varios colores. Para tapizar muebles, cojines, cortinas y proyectos de decoración.",
    price: 5.95,
    source: LISTA_CM("1000162275"),
  },

  // ---------------- Telas navideñas ----------------
  // La imagen de la lista trae dos precios: 4.95 arriba del rótulo (el
  // de siempre) y 3.95 puesto sobre la foto de la tela azul.
  {
    id: "telas-navidenas",
    name: "Telas navideñas",
    category: "Telas navideñas",
    desc: "Telas con estampados de Navidad: Santa Claus, flores de pascua, bastones de caramelo y más motivos festivos. Para manteles, caminos de mesa, cojines, botas y decoración de temporada.",
    price: 4.95,
    source: LISTA_CM("1000162303"),
  },
  {
    id: "tela-navidena-nacimiento",
    name: "Tela navideña del Nacimiento",
    category: "Telas navideñas",
    desc: "Tela navideña azul con escenas del Nacimiento. Para manteles, caminos de mesa, cojines y decoración de temporada.",
    price: 3.95,
    source: LISTA_CM("1000162303"),
  },

  // ---------------- Tela para sabanillas ----------------
  {
    id: "lanilla",
    name: "Lanilla",
    category: "Tela para sabanillas",
    desc: "Lanilla suave y abrigada con estampados infantiles: animalitos, ballenas, lunares y más. Para sabanillas, pijamas y ropa de bebé.",
    price: 3.95,
    source: LISTA_CM("1000162277"),
  },
  {
    id: "frazadas",
    name: "Frazadas",
    category: "Tela para sabanillas",
    desc: "Tela para frazadas, suave y abrigada, con estampados infantiles y de personajes. Para frazadas, mantas y cobijas de bebé.",
    price: 3.95,
    source: LISTA_CM("1000162281"),
  },
  {
    id: "panos-colcha-bebe",
    name: "Paños para colcha de bebés",
    category: "Tela para sabanillas",
    desc: "Paños estampados para armar colchas de bebé, con ositos y motivos infantiles en tonos pastel. También hay tela acolchada en rollo.",
    price: 5.95,
    source: LISTA_CM("1000162289"),
  },

  // ---------------- Hilos ----------------
  {
    id: "hilos-de-tejer",
    name: "Hilos de tejer",
    category: "Hilos",
    unit: "unidad",
    desc: "Hilos y estambres para tejer a crochet o a dos agujas, en decenas de colores: acrílicos, de algodón, matizados y para amigurumi. También agujas de crochet y de tejer.",
  },

  // ---------------- Sedería ----------------
  {
    id: "encajes-y-puntillas",
    name: "Encajes y puntillas",
    category: "Sedería",
    desc: "Encajes y puntillas blancas en tira, en distintos anchos y diseños. Para ribetear vestidos, blusas, manteles, cortinas y ropa de bebé.",
  },
  {
    id: "colorante-mariposa",
    name: "Colorante para ropa Mariposa",
    category: "Sedería",
    unit: "unidad",
    desc: "Colorante para ropa marca Mariposa, en cristales de color. Caja de 32 g. Colores: azul claro, azul marino, castaño oscuro y rojo escarlata, entre otros.",
    price: 2.5,
    source: "Etiqueta de precio en cada caja de la foto (3-sep-2026). Pendiente de confirmar con la tienda.",
  },
  {
    id: "bolsas-de-regalo",
    name: "Bolsas de regalo de papel",
    category: "Sedería",
    unit: "unidad",
    desc: "Bolsas de papel con asas para regalo, en varios tamaños y colores: kraft, blanco, negro, naranja, verde y más. Se venden por unidad o por docena.",
  },
  {
    id: "papel-en-rollo",
    name: "Papel en rollo de colores",
    category: "Sedería",
    unit: "unidad",
    desc: "Papel en rollo de colores lisos para envolver regalos, manualidades y decoración: negro, verde, azul, amarillo, gris, blanco, rojo, rosado y kraft.",
  },
];

/* --------------------------------------------------------------
   Forma única para el resto del código: todo artículo tiene una
   lista de `variants` (una sola si no hay opciones), y lo que se
   vende, se cobra y se guarda en un pedido es siempre una variante.
-------------------------------------------------------------- */
export const INVENTORY = ITEMS.map(({ price = null, options, source = null, unit = "yarda", ...rest }) => ({
  ...rest,
  unit,
  variants: options
    ? options.map((o) => ({ id: o.id, label: o.label ?? null, price: o.price ?? null, note: o.price == null ? null : source }))
    : [{ id: rest.id, label: null, price, note: price == null ? null : source }],
}));
