# Textilindo

Tienda en línea de **Textilindo** — catálogo de telas, hilos, cintas, molas kunas
y souvenirs, con pedidos que se cierran por WhatsApp. React + Vite + Tailwind v4,
sitio 100% estático (sin backend).

---

## Correr el proyecto

Requiere Node 20 o superior (el proyecto está fijado a Node 22 en `.nvmrc`).

```bash
npm install      # solo la primera vez
npm run dev      # servidor local en http://localhost:5173
npm run build    # genera dist/ para producción
npm run preview  # revisa el dist/ ya compilado
npm run lint     # eslint

npm run catalog:photos  # convierte los collages del fotógrafo en fotos de catálogo
npm run images          # comprime las fotos sueltas de src/assets/tienda y about
```

---

## Qué se edita y dónde

| Quiero cambiar…                     | Archivo                          |
| ----------------------------------- | -------------------------------- |
| Nombre, WhatsApp, Yappy, envío      | `src/config/store.js`             |
| Productos, precios, stock, fotos    | `src/data/products.js`            |
| Métodos de pago                     | `src/data/paymentMethods.js`      |
| Provincias de envío                 | `src/data/provinces.js`           |
| Colores y tipografía de marca       | `src/index.css` (bloque `@theme`) |
| Texto del Hero / Nosotros / Footer  | `src/components/…`                |

### Ponerle precio a un producto

Los productos del inventario real están en `src/data/products.js` como
`item(id, nombre, categoría, descripción)`. Mientras no tengan precio salen
como **"Precio a consultar"** y su botón abre WhatsApp. Para venderlos por el
carrito basta con agregar el precio:

```js
item("organza", "Organza", "Organza", "…descripción…", { price: 2.95 })
```

Opcionales en el mismo objeto: `stock` (0 = "Agotado", ≤ 5 = "¡Quedan N!"; sin
ponerlo no se controla), `compareAt` (precio anterior, tachado), `badge`
("Nuevo", "Oferta"…) y `cost` (para la tabla de márgenes del panel).

La **categoría** es simplemente el tercer dato: escribir una que no existe la
crea, y su pastilla de filtro aparece sola.

### Agregar fotos o productos nuevos

El fotógrafo manda collages (dos o tres fotos pegadas, con un recuadro blanco
que dice el nombre). El script los separa en fotos limpias y recorta el recuadro:

1. Pon los collages en `fotos-originales/<carpeta>/`. Esa carpeta **no se sube
   a git** (pesa 34 MB); lo que se versiona es el resultado.
2. En `scripts/build-catalog-photos.mjs`, agrega en `CATALOG` qué parte de qué
   collage va con qué producto (arriba, abajo-izquierda…). Hay ejemplos de
   todos los casos.
3. `npm run catalog:photos` — si olvidaste asignar alguna foto, te lo avisa.
4. Revisa el resultado en `src/assets/catalogo/<producto>/`.
5. Si el producto es nuevo, agrégale su `item(...)` en `src/data/products.js`
   con el mismo `id` que la carpeta. Las fotos se enlazan solas.

---

## Publicar en Netlify

El repo ya trae `netlify.toml` con todo configurado (build, publish, headers de
caché, Node 22). No hay que tocar nada en el panel de Netlify.

**1. Subir el código a GitHub**

```bash
git remote add origin https://github.com/<tu-usuario>/textilindo.git
git branch -M main
git push -u origin main
```

**2. Conectar en Netlify**

Netlify → *Add new site* → *Import an existing project* → GitHub → elige el repo.
Detecta la config sola (`npm run build` → `dist`). Click en **Deploy**.

Desde ahí, cada `git push` a `main` republica el sitio automáticamente.

**3. Dominio**

Netlify → *Domain management* → *Add a domain*. Puedes comprar el dominio ahí
mismo o apuntar uno que ya tengas cambiando los nameservers. El HTTPS se
configura solo.

Después de fijar el dominio, actualiza las URLs en `index.html`
(`canonical`, `og:url`, `og:image`) y en `public/robots.txt`.

---

## Pendientes antes de salir al aire

- [x] ~~Número de WhatsApp real~~ — listo: `50769413385` (WhatsApp Business).
- [ ] **Handle de Yappy real** en `src/config/store.js` (ahora `@textilindo`).
- [x] ~~`public/og-image.jpg`~~ — listo.
- [x] ~~`#admin` público~~ — listo: pide sesión con rol de empleado o admin.
- [ ] **Lista de precios del inventario real.** 23 de los 24 productos reales
      están como "Precio a consultar" (ver *Ponerle precio a un producto*).
- [ ] Decidir qué hacer con los 10 productos de muestra del final de
      `src/data/products.js`: sus precios, costos y existencias son de relleno.
- [ ] Confirmar con la tienda cómo se escriben **Scall** y **Sutin** (van tal
      como venían en los rótulos de las fotos).
