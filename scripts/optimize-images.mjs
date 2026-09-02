import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

/* ==============================================================
   OPTIMIZADOR DE IMÁGENES  —  npm run images

   Las fotos salen del teléfono a 3000-4000 px y de 500 KB a 5 MB.
   En la página nunca se ven a más de ~600 px, así que el cliente
   descarga diez veces lo que necesita — y en Panamá eso se paga en
   datos móviles.

   Reescribe los archivos EN SU LUGAR, con el mismo nombre y el mismo
   formato, para no tocar ningún import. Los originales están en git:
   si algo sale mal, `git checkout src/assets` los devuelve.

   Es idempotente: volver a correrlo sobre imágenes ya optimizadas no
   las degrada, porque solo reduce las que superan el ancho objetivo y
   descarta cualquier resultado que no sea más liviano que el original.

   Uso:
     npm run images          optimiza src/assets
     npm run images -- --dry solo muestra qué haría
============================================================== */

const RULES = [
  // El logo se muestra a 48 px de alto en el header.
  { when: (p) => p.includes("textilindologo"), maxWidth: 600, quality: 82 },
  // La foto del hero ocupa todo el ancho en escritorio.
  { when: (p) => p.includes("tienda/1000405877"), maxWidth: 1800, quality: 78 },
  // Fotos de producto: la página las muestra a ~600 px (1200 en pantalla 2x).
  { when: (p) => p.includes("tienda/"), maxWidth: 1400, quality: 78 },
  // Las de "nosotros" ya venían pequeñas.
  { when: (p) => p.includes("about/"), maxWidth: 1000, quality: 80 },
];

const SKIP_UNDER_KB = 60; // ya pesa poco: recomprimir solo perdería calidad

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const toUnix = (p) => p.split(path.sep).join("/");

const root = process.argv[2] ?? "src/assets";
const dryRun = process.argv.includes("--dry");
let before = 0, after = 0, touched = 0, skipped = 0;

for await (const file of walk(root)) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

  // Rutas siempre con "/" para que las reglas den igual en Windows.
  const rule = RULES.find((r) => r.when(toUnix(file)));
  if (!rule) continue;

  const original = await fs.readFile(file);
  const meta = await sharp(original).metadata();
  before += original.length;

  const needsResize = meta.width > rule.maxWidth;
  if (!needsResize && original.length < SKIP_UNDER_KB * 1024) {
    after += original.length;
    skipped++;
    continue;
  }

  let pipeline = sharp(original).rotate(); // respeta la orientación EXIF
  if (needsResize) {
    pipeline = pipeline.resize({ width: rule.maxWidth, withoutEnlargement: true });
  }

  pipeline =
    ext === ".png"  ? pipeline.png({ quality: rule.quality, compressionLevel: 9 })
  : ext === ".webp" ? pipeline.webp({ quality: rule.quality })
  :                   pipeline.jpeg({ quality: rule.quality, mozjpeg: true, progressive: true });

  const out = await pipeline.toBuffer();

  // Si "optimizar" engorda el archivo, se deja como estaba.
  if (out.length >= original.length) {
    after += original.length;
    skipped++;
    continue;
  }

  if (!dryRun) await fs.writeFile(file, out);
  after += out.length;
  touched++;

  const pct = Math.round((1 - out.length / original.length) * 100);
  console.log(
    toUnix(path.relative(root, file)).padEnd(30) +
      String(Math.round(original.length / 1024)).padStart(6) + " KB → " +
      String(Math.round(out.length / 1024)).padStart(5) + " KB  (-" + pct + "%)" +
      (needsResize ? `   ${meta.width}px → ${rule.maxWidth}px` : "")
  );
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log(
  `\n${touched} optimizadas, ${skipped} sin cambios\n` +
    `${mb(before)} MB → ${mb(after)} MB  (-${Math.round((1 - after / before) * 100)}%)` +
    (dryRun ? "\n\n(--dry: no se escribió nada)" : "")
);
