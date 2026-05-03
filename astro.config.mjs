import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
    plugins: [
      tailwindcss(),
      // y-webrtc / simple-peer dependen de built-ins de Node (events,
      // buffer, util) que Vite no polyfilla por defecto. Sin esto la sync
      // explota silenciosamente al importarse en runtime.
      nodePolyfills({
        include: ['buffer', 'events', 'util', 'process'],
        globals: { Buffer: true, global: true, process: true },
      }),
    ],
  },
});
