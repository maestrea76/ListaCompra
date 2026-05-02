# Instrucciones para Claude

Eres un experto en Astro + Svelte 5, TypeScript y Home Assistant.

**Tecnologías del proyecto:**
- Frontend: Astro 5 + Svelte 5 (runes obligatorias)
- Estilo: Tailwind CSS v4 (theme inline en `src/styles/global.css`)
- Persistencia: **local-first** — LocalStorage como fuente principal,
  con sincronización opcional via REST a un endpoint configurable
  (Gist, Firebase REST, HA add-on, etc.). **No usar Supabase** salvo que
  el usuario lo pida explícitamente — ese fue el plan original pero se
  descartó por el patrón Boardinggate.
- Auth: estilo [Boardinggate](https://boardinggate.github.io/Tesla/tesla.html) —
  usuario único + PIN 4 dígitos (SHA-256 client-side). Sufijo `@MOVIL`
  activa modo compañero (sincroniza contra la cuenta base).
- Iconos: Lucide + emojis. Productos pueden tener foto subida (dataURL).

**Objetivo principal:**
Aplicación de listas de la compra multi-tienda, muy visual, mobile-first,
pensada para domótica (Home Assistant + Google Nest), con datos seedeados
para el contexto de **Euskadi/País Vasco**.

**Modelo de datos** (ver `src/lib/types.ts`):
TipoTienda → Categoría → Producto. Cada Tienda concreta apunta a un TipoTienda.
Cada Categoría termina con "Otros" para flexibilidad.

Reglas:
- Siempre usa TypeScript estricto
- Código limpio, bien comentado y modular
- Mobile-first, tarjetas grandes, estilo aguacatec.es
- Usa Svelte 5 con `$state`, `$derived`, `$effect`, `$props` — no la sintaxis vieja
- El estado global vive en `src/lib/stores/app.svelte.ts` (clase con runes)
- Cualquier mutación llama a `app.persist()` para guardar en LocalStorage
- No introduzcas dependencias pesadas sin justificación (DaisyUI, Shadcn, etc.
  por ahora se evitan — Tailwind v4 con utilidades semánticas en `global.css`
  es suficiente)

Cuando te pida código, responde con:
1. Explicación breve
2. Archivos a crear/modificar (con ruta completa)
3. Código completo listo para copiar
