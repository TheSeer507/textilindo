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

### Agregar un producto

1. Pon la foto en `src/assets/tienda/`.
2. Impórtala arriba en `src/data/products.js`.
3. Agrega el objeto al array `PRODUCTS` (`id`, `name`, `category`, `price`,
   `stock`, `images: [tuFoto]`, …).

`stock: 0` muestra "Agotado" y bloquea el botón; `stock ≤ 5` muestra "¡Quedan N!".

> **Comprime las fotos antes de subirlas.** Varias imágenes actuales pesan
> ~500 KB. Pásalas a WebP de ancho ≤ 1600 px para que el sitio cargue rápido
> en datos móviles.

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

- [ ] **Número de WhatsApp real** en `src/config/store.js` — ahora es el
      placeholder `50760000000` y ningún pedido llega.
- [ ] **Handle de Yappy real** en `src/config/store.js` (ahora `@textilindo`).
- [ ] Subir `public/og-image.jpg` (1200×630) para la vista previa al compartir
      el link por WhatsApp o Facebook.
- [ ] Revisar `#admin`: la ruta es pública y muestra costos y márgenes a
      cualquiera que la escriba en la URL.
