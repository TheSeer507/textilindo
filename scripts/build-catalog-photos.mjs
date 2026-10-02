import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

/* ==============================================================
   FOTOS DEL CATÁLOGO  —  npm run catalog:photos

   Las fotos llegan del fotógrafo como "collages" tipo historia de
   Instagram (1080x1920): dos o tres fotos pegadas y, encima de la
   unión, un recuadro blanco con el nombre del producto.

   Ese recuadro no se puede "borrar" sin inventar los píxeles que
   tapa. Pero como siempre cae sobre la costura entre dos fotos, sí
   se puede hacer algo mejor: separar el collage en sus fotos reales
   y recortar la franja que tapaba. El resultado son fotos limpias,
   sin un solo píxel inventado, y varias por producto.

     fotos-originales/<carpeta>/<archivo>     lo que mandó el fotógrafo
        ↓  (este script)
     src/assets/catalogo/<producto>/<producto>-01.webp       galería, en orden
     src/assets/catalogo/<producto>/<producto>-01.mini.webp  su miniatura para la tira
     src/assets/catalogo/<producto>/<producto>-thumb.webp    portada cuadrada

   (El nombre del producto va también en el archivo para que la URL
   publicada de cada imagen sea descriptiva: organza-01.webp, no 01.webp.)

   El recuadro se detecta solo (por eso el recorte queda exacto en
   cada foto). Lo que NO se adivina es qué foto va con qué producto
   ni cómo está armado cada collage: eso está escrito abajo, en
   CATALOG, y se revisó a ojo foto por foto.

   Los originales no se tocan nunca. Volver a correrlo da el mismo
   resultado.
============================================================== */

const SRC = "fotos-originales";
const OUT = "src/assets/catalogo";

const FULL_MAX = 1400; // lado mayor de la foto de galería
const THUMB = 640;     // portada cuadrada de la tarjeta
const MINI = 160;      // miniatura de la tira de la galería (se ve a 56 px)
const MARGIN = 10;     // aire alrededor del recuadro (su borde es duro: 2 px de transición)
const INSET = 3;       // para no arrastrar el filo de la foto vecina

/* --------------------------------------------------------------
   Regiones del collage (1080x1920). Casi todos son una foto arriba
   y una o dos abajo; unos pocos van en dos columnas.
-------------------------------------------------------------- */
const TOP = [0, 0, 1080, 960];
const BOTTOM = [0, 960, 1080, 1920];
const TL = [0, 0, 540, 960];
const TR = [540, 0, 1080, 960];
const BL = [0, 960, 540, 1920];
const BR = [540, 960, 1080, 1920];
const LEFT = [0, 0, 540, 1920];

/** Panel de un collage. `keep` dice de qué lado del recuadro quedarse
    ("above" | "below"); "auto" elige el pedazo que da el cuadrado más grande. */
const collage = (file, panel, keep = "auto") => ({ file, rect: panel, keep, collage: true });
/** Foto normal, sin recuadro. `rect` la recorta; sin `rect` va completa. */
const photo = (file, rect = null) => ({ file, rect, collage: false });

const ALGODON_1 = "algodon/IMG_20260907_150000_653.webp";
const ALGODON_2 = "algodon/IMG_20260907_150532_118.webp";
const ALGODON_3 = "algodon/IMG_20260907_152514_779.webp";
const HILOS = "hilos de tejer/IMG_20260907_155316_470.webp";
const CHIFON = "tela chifon/IMG_20260907_152233_092.webp";
const CHIFON_EST = "tela chifon/IMG_20260907_152445_030.webp";
const PANOS = "tela para sabanillas/IMG_20260907_130021_534.webp";
const vestidos = (n) => `tela de vestidos/IMG_20260907_${n}.webp`;

/* --------------------------------------------------------------
   QUÉ FOTO VA CON QUÉ PRODUCTO
   La clave es el `id` del producto en src/data/products.js.
   El orden es el de la galería; la primera es la portada.

   Cuando abajo aparece solo BL y no BR, es porque el fotógrafo
   puso la MISMA foto dos veces en el collage.
-------------------------------------------------------------- */
const CATALOG = {
  // ---- Algodón: tres collages con el mismo rótulo ----
  algodon: [
    collage(ALGODON_1, TOP),
    collage(ALGODON_2, TOP),
    collage(ALGODON_3, LEFT, "above"),
    collage(ALGODON_1, BOTTOM),
    collage(ALGODON_2, BL),
    // La columna derecha es UNA foto de cuatro rollos apilados; el
    // recuadro la parte en dos. Arriba y abajo le sobra fondo negro.
    collage(ALGODON_3, [540, 112, 1080, 1920], "above"),
    collage(ALGODON_3, [540, 0, 1080, 1866], "below"),
  ],

  // ---- Tela de vestidos: seis telas distintas en una carpeta ----
  satin: [collage(vestidos("125738_516"), TOP), collage(vestidos("125738_516"), BR)], // BL repite la de arriba
  "crepe-satinado": [collage(vestidos("150454_036"), TOP), collage(vestidos("150454_036"), BOTTOM)],
  poplin: [collage(vestidos("125250_231"), TOP), collage(vestidos("125250_231"), BOTTOM)],
  scall: [collage(vestidos("124649_607"), TOP), collage(vestidos("124649_607"), BL), collage(vestidos("124649_607"), BR)],
  sutin: [
    collage(vestidos("125429_897"), TOP),
    collage(vestidos("125429_897"), BL),
    collage(vestidos("125429_897"), [540, 1100, 1080, 1920]), // BR sin la rejilla del estante
  ],
  "tela-de-cuadritos": [collage(vestidos("124750_059"), TOP), collage(vestidos("124750_059"), BL), collage(vestidos("124750_059"), BR)],

  // ---- Chifón ----
  // Portada: los rollos de colores. El acercamiento crema, solo, se ve
  // como un cuadro en blanco al lado de las demás tarjetas.
  chifon: [
    collage(CHIFON, [540, 0, 1080, 1920], "above"), // la columna de rollos, partida por el recuadro
    collage(CHIFON, LEFT, "above"),
    collage(CHIFON, [540, 0, 1080, 1920], "below"),
  ],
  // Este collage tiene la costura más abajo que los demás (1011, no 960).
  "chifon-estampado-lentejuelas": [collage(CHIFON_EST, [0, 0, 1080, 1011]), collage(CHIFON_EST, [0, 1011, 1080, 1920])],

  // Portada: el acercamiento (abajo en el collage), como en las demás telas.
  organza: [collage("organza/IMG_20260907_125500_273.webp", BL), collage("organza/IMG_20260907_125500_273.webp", TOP)],
  tull: [collage("tull/IMG_20260907_124722_599.webp", TOP), collage("tull/IMG_20260907_124722_599.webp", BL), collage("tull/IMG_20260907_124722_599.webp", BR)],
  // BR es más encaje azul, igual al de arriba.
  encaje: [collage("tela encaje/IMG_20260907_150245_428.webp", TOP), collage("tela encaje/IMG_20260907_150245_428.webp", BL)],
  "tela-para-toalla": [collage("tela de toalla/IMG_20260907_135546_094.webp", TOP), collage("tela de toalla/IMG_20260907_135546_094.webp", BL)],
  "tela-para-sueter": [collage("tela para sueter/IMG_20260907_150558_170.webp", TOP), collage("tela para sueter/IMG_20260907_150558_170.webp", BL)],
  "tela-tapiz": [
    // Solo la tela: a los lados de la foto de arriba se ve el pasillo de la tienda.
    collage("tela tapiz/IMG_20260907_125004_401.webp", [205, 0, 945, 960]),
    collage("tela tapiz/IMG_20260907_125004_401.webp", BL),
    collage("tela tapiz/IMG_20260907_125004_401.webp", BR),
  ],
  "telas-navidenas": [collage("tela navideñas/IMG_20260907_151911_539.webp", TOP), collage("tela navideñas/IMG_20260907_151911_539.webp", BL), collage("tela navideñas/IMG_20260907_151911_539.webp", BR)],

  // ---- Tela para sabanillas: tres productos ----
  lanilla: [collage("tela para sabanillas/IMG_20260907_125125_670.webp", TOP), collage("tela para sabanillas/IMG_20260907_125125_670.webp", BL), collage("tela para sabanillas/IMG_20260907_125125_670.webp", BR)],
  frazadas: [collage("tela para sabanillas/IMG_20260907_125322_884.webp", TOP), collage("tela para sabanillas/IMG_20260907_125322_884.webp", BL), collage("tela para sabanillas/IMG_20260907_125322_884.webp", BR)],
  "panos-colcha-bebe": [
    collage(PANOS, TOP),
    photo("tela para sabanillas/IMG-20260907-WA0024.jpeg", [10, 92, 2042, 2596]), // el paño completo, sin la persona ni el piso
    collage(PANOS, BL),
  ],

  // ---- Hilos: collage de 2x2 + una foto suelta ----
  "hilos-de-tejer": [
    collage(HILOS, TL),
    collage(HILOS, TR),
    collage(HILOS, BL),
    // BR del collage es esta misma foto en chiquito: se usa el original.
    photo("hilos de tejer/20260903_122543.jpg", [90, 585, 2955, 3750]),
  ],

  // ---- Sedería: fotos sueltas, sin recuadro ----
  "encajes-y-puntillas": [photo("sederia/20260903_122816.jpg", [0, 682, 4000, 3000])], // fuera las piernas del fondo
  "colorante-mariposa": [photo("sederia/20260903_122923.jpg", [447, 24, 3235, 2729])], // solo las cajas
  "bolsas-de-regalo": [photo("sederia/20260903_130136.jpg", [259, 95, 2468, 3941])],
  "papel-en-rollo": [photo("sederia/20260903_130121.jpg", [0, 273, 3000, 3927])],
};

/* ==============================================================
   DETECCIÓN DEL RECUADRO
   Es un rectángulo blanco puro con texto negro. Se buscan, fila por
   fila, tramos largos de blanco; las filas del margen superior e
   inferior del recuadro comparten exactamente el mismo inicio y fin,
   y eso las delata frente a cualquier tela blanca de la foto.
============================================================== */
function findLabel({ data, W, H }) {
  const WHITE = 249, MIN_RUN = 110;
  const isWhite = (x, y) => {
    const i = (y * W + x) * 3;
    return data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE;
  };

  const groups = []; // tramos con casi el mismo inicio y fin
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      if (!isWhite(x, y)) { x++; continue; }
      const x0 = x;
      while (x < W && isWhite(x, y)) x++;
      const x1 = x - 1;
      if (x1 - x0 + 1 < MIN_RUN) continue;
      let g = groups.find((g) => Math.abs(g.x0 - x0) <= 2 && Math.abs(g.x1 - x1) <= 2);
      if (!g) groups.push((g = { x0, x1, rows: [] }));
      g.rows.push(y);
      g.x0 = Math.min(g.x0, x0);
      g.x1 = Math.max(g.x1, x1);
    }
  }

  const candidates = [];
  for (const g of groups) {
    if (g.rows.length < 25) continue;
    // Las líneas de texto cortan los tramos: se toleran huecos de hasta 90 filas.
    let best = null, start = 0;
    for (let i = 1; i <= g.rows.length; i++) {
      if (i === g.rows.length || g.rows[i] - g.rows[i - 1] > 90) {
        if (!best || i - start > best.n) best = { y0: g.rows[start], y1: g.rows[i - 1], n: i - start };
        start = i;
      }
    }
    const w = g.x1 - g.x0 + 1, h = best.y1 - best.y0 + 1;
    if (w < 140 || h < 70 || h > 420) continue;

    let white = 0, dark = 0;
    for (let y = best.y0; y <= best.y1; y++) {
      for (let x = g.x0; x <= g.x1; x++) {
        const i = (y * W + x) * 3;
        if (isWhite(x, y)) white++;
        else if (data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) dark++;
      }
    }
    const area = w * h;
    // Mucho blanco y un poco de tinta negra: eso es un rótulo.
    if (white / area > 0.72 && dark / area > 0.015 && dark / area < 0.25) {
      candidates.push({ x: g.x0, y: best.y0, w, h, score: area * (white / area) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] ?? null;
}

/* ==============================================================
   RECORTE
============================================================== */
function cropFor(entry, label) {
  if (!entry.collage) return entry.rect ? toBox(entry.rect) : null; // foto suelta: tal cual

  const [rx0, ry0, rx1, ry1] = entry.rect;
  const p = { x0: rx0 + INSET, y0: ry0 + INSET, x1: rx1 - INSET, y1: ry1 - INSET };
  const L = { x0: label.x - MARGIN, y0: label.y - MARGIN, x1: label.x + label.w + MARGIN, y1: label.y + label.h + MARGIN };

  const touches = L.x1 > p.x0 && L.x0 < p.x1 && L.y1 > p.y0 && L.y0 < p.y1;
  if (!touches) return p;

  const sides = {
    above: { ...p, y1: Math.min(p.y1, L.y0) },
    below: { ...p, y0: Math.max(p.y0, L.y1) },
    left: { ...p, x1: Math.min(p.x1, L.x0) },
    right: { ...p, x0: Math.max(p.x0, L.x1) },
  };
  if (entry.keep !== "auto") return sides[entry.keep];

  // La tienda muestra las fotos en cuadrado: gana el pedazo donde cabe
  // el cuadrado más grande y, si empatan, el de mayor área.
  const side = (r) => Math.min(r.x1 - r.x0, r.y1 - r.y0);
  const area = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);
  return Object.values(sides).sort((a, b) => side(b) - side(a) || area(b) - area(a))[0];
}
const toBox = ([x0, y0, x1, y1]) => ({ x0, y0, x1, y1 });

/** ¿Quedó un filo blanco pegado al borde del recorte? Sería un resto del recuadro. */
function whiteEdge({ data, W }, box) {
  const longRun = (fixed, from, to, horizontal) => {
    let run = 0, best = 0;
    for (let v = from; v < to; v++) {
      const i = ((horizontal ? fixed : v) * W + (horizontal ? v : fixed)) * 3;
      run = data[i] >= 249 && data[i + 1] >= 249 && data[i + 2] >= 249 ? run + 1 : 0;
      best = Math.max(best, run);
    }
    return best;
  };
  return Math.max(
    longRun(box.y0, box.x0, box.x1, true),
    longRun(box.y1 - 1, box.x0, box.x1, true),
    longRun(box.x0, box.y0, box.y1, false),
    longRun(box.x1 - 1, box.y0, box.y1, false)
  );
}

/* ==============================================================
   PROCESO
============================================================== */
const cache = new Map();
async function load(file) {
  if (!cache.has(file)) {
    // .rotate() aplica la orientación EXIF: todas las coordenadas de
    // CATALOG están medidas sobre la foto ya derecha.
    const { data, info } = await sharp(path.join(SRC, file)).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
    cache.set(file, { data, W: info.width, H: info.height });
  }
  return cache.get(file);
}
const fromRaw = (img) => sharp(img.data, { raw: { width: img.W, height: img.H, channels: 3 } });

try {
  await fs.access(SRC);
} catch {
  console.error(
    `No encuentro la carpeta "${SRC}/".\n` +
      `Ahí van los collages originales del fotógrafo (no se suben a git).\n` +
      `Este paso solo hace falta cuando llegan fotos nuevas: la tienda ya\n` +
      `trae las fotos listas en ${OUT}/.`
  );
  process.exit(1);
}

const labels = new Map();
const warnings = [];
let photos = 0, bytes = 0;

for (const [product, entries] of Object.entries(CATALOG)) {
  const dir = path.join(OUT, product);
  await fs.mkdir(dir, { recursive: true });
  let productBytes = 0;

  for (let n = 0; n < entries.length; n++) {
    const entry = entries[n];
    const img = await load(entry.file);

    let label = null;
    if (entry.collage) {
      if (!labels.has(entry.file)) labels.set(entry.file, findLabel(img));
      label = labels.get(entry.file);
      // Un collage jamás sale sin haber ubicado su recuadro: mejor
      // fallar aquí que publicar una foto con el rótulo encima.
      if (!label) {
        console.error(`\n✖ No encontré el recuadro en "${entry.file}". No se exportó nada de ese collage.`);
        process.exit(1);
      }
    }

    const box = cropFor(entry, label) ?? { x0: 0, y0: 0, x1: img.W, y1: img.H };
    const region = { left: box.x0, top: box.y0, width: box.x1 - box.x0, height: box.y1 - box.y0 };

    if (entry.collage && whiteEdge(img, box) >= 100) {
      warnings.push(`${product}/${String(n + 1).padStart(2, "0")}: hay un filo blanco en el borde — ¿quedó parte del recuadro?`);
    }

    const out = await fromRaw(img)
      .extract(region)
      .resize({ width: FULL_MAX, height: FULL_MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer();
    const nn = String(n + 1).padStart(2, "0");
    await fs.writeFile(path.join(dir, `${product}-${nn}.webp`), out);
    productBytes += out.length;
    photos++;

    // Cuadrado centrado: sirve para la miniatura y para la portada.
    const s = Math.min(region.width, region.height);
    const square = {
      left: region.left + Math.floor((region.width - s) / 2),
      top: region.top + Math.floor((region.height - s) / 2),
      width: s,
      height: s,
    };

    /* La tira de la galería dibuja todas las fotos a 56 px. Sin esto, abrir
       un producto bajaba cada foto completa solo para pintar ese cuadrito. */
    const mini = await fromRaw(img).extract(square).resize({ width: MINI, height: MINI }).webp({ quality: 70 }).toBuffer();
    await fs.writeFile(path.join(dir, `${product}-${nn}.mini.webp`), mini);
    productBytes += mini.length;

    // Portada de la tarjeta: la primera foto.
    if (n === 0) {
      const thumb = await fromRaw(img)
        .extract(square)
        .resize({ width: Math.min(s, THUMB), height: Math.min(s, THUMB) })
        .webp({ quality: 78 })
        .toBuffer();
      await fs.writeFile(path.join(dir, `${product}-thumb.webp`), thumb);
      productBytes += thumb.length;
    }
  }

  // Si un producto pasó a tener menos fotos, se van las numeradas que sobran.
  for (const f of await fs.readdir(dir)) {
    const m = f.match(/-(\d\d)(?:\.mini)?\.webp$/);
    if (m && Number(m[1]) > entries.length) await fs.unlink(path.join(dir, f));
  }

  bytes += productBytes;
  console.log(`${product.padEnd(30)} ${String(entries.length).padStart(2)} fotos ${String(Math.round(productBytes / 1024)).padStart(5)} KB`);
}

/* --- Fotos que llegaron y todavía no están asignadas a un producto --- */
const used = new Set(Object.values(CATALOG).flat().map((e) => e.file));
const unassigned = [];
async function walk(dir, rel = "") {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) await walk(path.join(dir, e.name), r);
    else if (/\.(jpe?g|png|webp)$/i.test(e.name) && !used.has(r)) unassigned.push(r);
  }
}
await walk(SRC);

console.log(`\n${Object.keys(CATALOG).length} productos · ${photos} fotos · ${(bytes / 1024 / 1024).toFixed(1)} MB en ${OUT}/`);
if (warnings.length) console.log("\n⚠ Para revisar:\n  " + warnings.join("\n  "));
if (unassigned.length) {
  console.log(
    `\n⚠ ${unassigned.length} foto(s) en ${SRC}/ sin asignar a ningún producto:\n  ` +
      unassigned.join("\n  ") +
      `\n  Agrégalas a CATALOG en este archivo para que salgan en la tienda.`
  );
}
