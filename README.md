# 🛒 Tu Compra

Aplicación web de listas de la compra **multi-tienda** con integración Home Assistant
y comandos de voz Google Nest. Pensada y seedeada para hábitos de consumo de
**Euskadi / País Vasco** (txuleta, kokotxas, txakoli, idiazabal, perretxikos…).

> Versión inicial — scaffold funcional. Completar seeds pendientes y desplegar.

## Características

- 🏪 **Múltiples tiendas** (Eroski, Mercadona, Lidl, Carnicería, Farmacia, Ikea, …)
  agrupadas por **tipo** (Supermercado, Pescadería, Ferretería, …).
- 📦 **Catálogo jerárquico**: TipoTienda → Categoría → Producto. Última categoría
  siempre "Otros" para flexibilidad.
- 🎨 **Personalización total**: nombres, iconos (emoji / Lucide / foto subida),
  cantidades en unidades, kg, l, paquetes…
- 🔐 **Auth estilo Boardinggate**: usuario + PIN 4 dígitos, sin servidor obligatorio.
  Modo compañero (`@MOVIL`) para sincronizar entre coche/móvil.
- 🌙 **Tema claro/oscuro** persistido por usuario.
- 📱 **Mobile-first**, PWA-ready.
- 🏠 **Home Assistant**: sensores REST + REST commands + Assist (ver
  [`homeassistant/`](./homeassistant/)).

## Stack

- [Astro 5](https://astro.build/) + [Svelte 5](https://svelte.dev/) (runes)
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript estricto
- Persistencia: **LocalStorage** (local-first) con sincronización opcional via REST.

## Desarrollo

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # build estático en /dist
npm run build:static   # build con base /ListaCompra para GitHub Pages
```

## Despliegue

### Modo A — GitHub Pages (estático, single-user)

```bash
npm run build:static
```

Limitaciones: sin endpoint REST → no se puede *añadir* productos por voz desde HA,
sólo lectura del estado si se activa cloud sync contra un servicio externo.

### Modo B — Debian + nginx (recomendado para domótica)

1. Cambia `output: 'static'` por `output: 'server'` en `astro.config.mjs` y añade
   `@astrojs/node`.
2. Implementa los endpoints `src/pages/api/lists/[storeId]/items.ts` y
   `src/pages/api/state/[username].ts`.
3. `npm run build && node dist/server/entry.mjs` detrás de nginx + Let's Encrypt.

## Estructura

```
src/
├── components/
│   ├── auth/           # ProfileSetup, PinGate (estilo Boardinggate)
│   ├── list/           # StoreGrid, StoreCard, ListView
│   ├── ui/             # ThemeToggle
│   └── AppShell.svelte
├── layouts/Layout.astro
├── lib/
│   ├── data/           # seeds: storeTypes, stores, categories, products
│   ├── stores/app.svelte.ts   # estado global con runes
│   ├── storage.ts      # LocalStorage + cloud sync
│   └── types.ts
├── pages/
│   ├── index.astro
│   └── lista/[storeId].astro
└── styles/global.css
homeassistant/          # YAML de ejemplo + guía de integración
```

## Personalización del catálogo

Las tiendas, categorías y productos del seed son editables desde la UI y se
sobreescriben en LocalStorage.

Categorías con seed completo (~40 productos):
**Frutería, Carnicería, Pescadería, Lácteos, Limpieza, Panadería, Bebidas**.

Categorías con estructura creada pero seed pendiente (vacías hasta que se
completen): Charcutería, Despensa, Congelados, Snacks, Desayuno, Higiene, Bebé,
Mascotas, Farmacia/*, Perfumería/*, Ferretería/*, Ropa/*, Hogar/*, Delicatessen/*,
Herboristería/*, Locutorio/*.

## Roadmap corto

- [ ] Completar seeds restantes
- [ ] Editor de tiendas/categorías/productos en UI
- [ ] Subida de foto personalizada (FileReader → dataURL)
- [ ] Endpoints SSR para HA write
- [ ] Workflow GitHub Actions → Pages
- [ ] Service Worker + offline real

## Licencia

MIT
