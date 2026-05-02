import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// El repo se llama "ListaCompra", así que en GH Pages la app vive en
// https://maestrea76.github.io/ListaCompra/ → necesita `base: '/ListaCompra'`.
// En dev (npm run dev) eso no afecta porque BASE_URL queda en '/'.
const isPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  output: 'static',
  site: isPages ? 'https://maestrea76.github.io' : undefined,
  base: isPages ? '/ListaCompra' : undefined,
  trailingSlash: 'ignore',
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
