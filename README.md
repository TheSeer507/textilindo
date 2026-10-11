# Textilindo

Tienda en línea de **Textilindo** — catálogo de telas (por yarda), hilos, cintas
y sedería, con pedidos que se cierran por WhatsApp. React + Vite + Tailwind v4;
las cuentas, los pedidos y los precios viven en Supabase.

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
npm run catalog:sql     # arma el SQL que carga artículos y precios a la base
npm run images          # comprime las fotos sueltas de src/assets/tienda y about
```

---

## Qué se edita y dónde

| Quiero cambiar…                     | Archivo                          |
| ----------------------------------- | -------------------------------- |
| Nombre, WhatsApp, Yappy, envío      | `src/config/store.js`             |
| **Un precio**, o marcar algo agotado | Panel `#admin` → *Catálogo y precios* |
| Artículos nuevos, nombres, textos   | `src/data/catalog.js`             |
| Fotos de los artículos              | `scripts/build-catalog-photos.mjs` |
| Productos de muestra (los 10 viejos) | `src/data/products.js`           |
| Métodos de pago                     | `src/data/paymentMethods.js`      |
| Provincias de envío                 | `src/data/provinces.js`           |
| Colores y tipografía de marca       | `src/index.css` (bloque `@theme`) |
| Texto del Hero / Nosotros / Footer  | `src/components/…`                |

### Precios: por yarda, y dónde viven

Las telas se venden **por yarda**: el precio se muestra "por yarda" y la cantidad
del carrito son yardas completas (media yarda u otra medida se acuerda por
WhatsApp). Lo demás (colorante, hilos, bolsas) se vende por unidad.

Todavía **no se lleva la cuenta de cuántas yardas quedan** de cada tela. En su
lugar hay un interruptor manual, *Disponible*, para marcar una tela como agotada.

**Para cambiar un precio:** entra a `#admin` con una cuenta de administrador →
*Catálogo y precios* → escribe el precio y sal de la casilla. Vacío = "Precio a
consultar" (el botón abre WhatsApp). La tienda lo muestra a quien cargue la
página desde ese momento; no hay que publicar nada. Cada cambio queda en el
historial con fecha y autor. Un empleado ve los precios pero no puede cambiarlos.

El precio que manda es el de la base de datos. Los de `src/data/catalog.js` son
la **carga inicial** y el respaldo que se muestra si la base no responde.

### Agregar un artículo o cargar un precio que faltaba

1. Agrégalo (o ponle `price`) en `src/data/catalog.js`:

   ```js
   { id: "satin", name: "Satín", category: "Tela de vestidos", desc: "…", price: 2.25 }

   // Varias presentaciones, cada una con su precio. El `id` de cada opción
   // no debe cambiar nunca: es su llave en la base y en los pedidos.
   { id: "organza", name: "Organza", category: "Organza", desc: "…",
     options: [
       { id: "organza-60",  label: "60″ de ancho",  price: 2.95 },
       { id: "organza-120", label: "120″ de ancho", price: 3.95 },
     ] }

   // Sin `price`: sale como "Precio a consultar".
   // `unit: "unidad"` para lo que no es tela (por defecto es "yarda").
   ```

2. `npm run catalog:sql` — vuelve a generar `supabase/migrations/0006_catalog_seed.sql`.
3. Pega ese archivo completo en Supabase → *SQL Editor* → *Run*.

Se puede correr las veces que haga falta: crea lo que falte y le pone precio
solo a lo que **nunca** ha tenido uno. No pisa un precio cambiado desde el panel
ni le devuelve el precio a algo que se dejó "a consultar".

Dos precios sin rótulo (como **Scall**, que llegó con $5.95 y $6.95 sin decir de
qué depende cada uno) se muestran como rango y mandan a WhatsApp. En cuanto las
opciones tengan `label` en la base, la página deja elegir y comprar.

La **categoría** es solo un texto: escribir una que no existe la crea, y su
pastilla de filtro aparece sola.

### Base de datos (Supabase)

Las tablas se crean pegando en Supabase → *SQL Editor* los archivos de
`supabase/migrations/`, **en orden** y una sola vez cada uno (todos se pueden
volver a correr sin daño):

| Archivo | Qué crea |
| ------- | -------- |
| `0001`–`0004` | Perfiles y roles, direcciones, pedidos |
| `0005_catalog.sql` | `products`, `product_variants` (el precio), `price_history`; y que cada renglón de pedido diga si su cantidad son yardas o unidades |
| `0006_catalog_seed.sql` | Carga los artículos y precios (archivo generado) |

La página funciona aunque `0005`/`0006` no se hayan corrido: muestra los precios
que trae empaquetados. Un `git push` **no** corre estos archivos.

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
5. Si el producto es nuevo, agrégalo en `src/data/catalog.js` con el mismo `id`
   que la carpeta (ver *Agregar un artículo*). Las fotos se enlazan solas.

Las imágenes de la lista de precios (`fotos-originales/Fotos_con_Precios/`) no
son fotos de catálogo: el script las ignora.

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
- [x] ~~Lista de precios del inventario real~~ — llegó en oct-2026 (por yarda):
      20 de los 27 artículos tienen precio.
- [ ] **Correr `0005_catalog.sql` y `0006_catalog_seed.sql`** en Supabase.
- [ ] Precio de los 7 que faltan: Algodón floral, Poplin, Tela de cuadritos,
      Hilos de tejer, Encajes y puntillas, Bolsas de regalo, Papel en rollo.
- [ ] **Scall** llegó con dos precios ($5.95 y $6.95): preguntar de qué depende
      cada uno y ponerles rótulo. Mientras tanto sale como rango → WhatsApp.
- [ ] Confirmar **Tela para toalla a $18.95** la yarda (el resto está entre
      $2.25 y $6.95) y el **Colorante a $2.50** (leído de la etiqueta de la foto).
- [ ] Confirmar los nombres que se les puso a las tres fotos de Algodón
      (estampado / de cuadros y rayas / floral): la tienda las rotuló igual
      pero con precios distintos.
- [ ] Decidir qué hacer con los 10 productos de muestra del final de
      `src/data/products.js`: sus precios, costos y existencias son de relleno.
- [ ] Confirmar con la tienda cómo se escriben **Scall** y **Sutin** (van tal
      como venían en los rótulos de las fotos).
