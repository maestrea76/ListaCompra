// Helper para construir URLs respetando el `base` de Astro.
// En `astro build --base /ListaCompra` (GH Pages), `import.meta.env.BASE_URL`
// vale "/ListaCompra/". En desarrollo o build sin base, vale "/".
//
// Uso en Svelte: `<a href={base('/lista/eroski')}>…</a>`

const RAW_BASE = (import.meta as ImportMeta).env?.BASE_URL ?? '/';

/** Asegura una sola barra entre el base y la ruta dada. */
export function base(path: string): string {
  const b = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}
