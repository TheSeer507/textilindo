import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    /* Nunca incrustar imágenes dentro del JavaScript.
       Vite convierte a base64 todo archivo de menos de 4 KB, y las
       miniaturas de la galería pesan justo eso: 28 de ellas terminaron
       dentro del paquete principal, que pasó de 20 a 100 KB (gzip) para
       TODOS los visitantes, vean o no un producto. Como archivos sueltos
       solo se descargan al abrir la galería que las usa. */
    assetsInlineLimit: 0,

    rollupOptions: {
      output: {
        /* Separar las librerías del código propio.
           React y Supabase casi nunca cambian; el código de la tienda
           cambia en cada despliegue. En un solo archivo, tocar un texto
           obligaba al cliente a bajar de nuevo los 476 KB completos.
           Partido así, el navegador reutiliza las librerías en caché y
           solo descarga lo que de verdad cambió. */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler"))
            return "react";
          return "vendor";
        },
      },
    },
  },
});
