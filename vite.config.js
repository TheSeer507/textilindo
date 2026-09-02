import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
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
