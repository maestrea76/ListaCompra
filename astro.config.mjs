import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Output estático: la app es local-first y puede desplegarse en GitHub Pages.
  // Para modo SSR (Debian + nginx con endpoints HA reales) cambia a 'server' y añade un adapter Node.
  output: 'static',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
