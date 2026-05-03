# 🛒 Tu Compra

Aplicación web de listas de la compra **multi-tienda** con sincronización
en tiempo real cifrada extremo-a-extremo. Pensada y seedeada para hábitos de
consumo de **Euskadi / País Vasco** (txuleta, kokotxas, txakoli, idiazabal,
perretxikos…) y resto de España (jamón ibérico, aceite de la Vera, fabes,
turrón de Jijona, vinos de Rioja/Ribera, etc.).

🔗 Demo: https://maestrea76.github.io/ListaCompra/

## Características principales

- 🏪 **24 tiendas predefinidas** (Eroski, Mercadona, Lidl, BM, Día, Carrefour,
  Alcampo, Carnicería, Pescadería, Farmacia, Ikea, Zara, Primark, Druni,
  Arenal, El Corte Inglés, Leroy Merlin, …) con logos reales o badges con
  colores corporativos. Añade/edita/borra desde la UI con un editor visual.
- 📦 **Catálogo de ~900 productos** organizado en jerarquía
  TipoTienda → Categoría → Producto. Cada producto con icono emoji por defecto,
  cantidad y unidad (unidad / kg / g / l / ml / paquete / docena / caja).
- 🔍 **Búsqueda inteligente** dentro de cada tienda: filtro por sección
  (categoría) + texto. Si no hay match, **Enter crea producto libre**.
- ✏️ **Edición inline por producto**: +/- de cantidad y selector de unidad
  sin abandonar la lista.
- 🔐 **Auth local estilo Boardinggate**: usuario + PIN 4 dígitos.
  Datos en LocalStorage. Sin servidor obligatorio para uso single-device.
- ☁️ **Sincronización online opcional** (Supabase + Realtime) con
  **cifrado E2E AES-GCM**. El servidor sólo ve bytes opacos.
  - Multi-dispositivo: tus listas siempre al día en móvil + portátil.
  - Multi-usuario: comparte una lista con tu pareja/familia vía `share_id`.
- 💾 **Backup en código** (offline): genera un string compacto (gzip+base64url)
  con tu estado para moverlo a otro dispositivo sin internet.
- 🌙 **Tema claro/oscuro** persistido por usuario.
- 📱 **Mobile-first**, PWA-ready (manifest + favicon).
- 🚀 **GitHub Pages** vía Actions (deploy automático en cada push a `main`).

## Stack

- [Astro 5](https://astro.build/) + [Svelte 5](https://svelte.dev/) (runes)
- [Tailwind CSS v4](https://tailwindcss.com/) con tema inline
- TypeScript estricto
- [Supabase](https://supabase.com/) (Postgres + Auth + Realtime) — opcional
- WebCrypto API (AES-GCM 256, PBKDF2-200k)

## Desarrollo

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # build estático en /dist
```

## Despliegue

### GitHub Pages (lo que usa la demo)

Workflow en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
En cada push a `main` se construye con `GITHUB_PAGES=true` (lo que activa el
`base: '/ListaCompra'` en `astro.config.mjs`) y se publica.

Para activarlo en tu fork: Settings → Pages → Source = **GitHub Actions**.

### Self-hosted

Como es output estático, sirve desde cualquier sitio (nginx, Caddy, Vercel,
Cloudflare Pages…). Si quieres **endpoints REST para Home Assistant**,
cambia a `output: 'server'` en `astro.config.mjs` y añade `@astrojs/node`
(no incluido por defecto).

## Sincronización online — setup propio

La demo apunta a un proyecto Supabase concreto. Si quieres uno tuyo:

1. Crea cuenta gratis en https://supabase.com (sin tarjeta).
2. Nuevo proyecto → anota `URL` y `publishable key` (Settings → API).
3. SQL Editor → pega y ejecuta el script de [`supabase/schema.sql`](supabase/schema.sql)
   (crea tablas `tucompra_snapshots` + `tucompra_members` y políticas RLS).
4. Edita [`src/lib/supabase.ts`](src/lib/supabase.ts) con tu URL y key.
5. (Opcional) Authentication → Providers → Email → desactiva "Confirm email"
   si quieres login sin verificación.
6. Build + deploy.

### Cómo funciona el cifrado E2E

- Al crear cuenta o iniciar sesión, el usuario define una **passphrase**
  (mín. 6 chars). Esta nunca se envía al servidor.
- La passphrase se pasa por **PBKDF2-SHA256 (200.000 iteraciones)** con un
  salt fijo → clave AES-GCM de 256 bits.
- Cada snapshot (perfil + listas + tiendas/productos custom) se serializa,
  se cifra con AES-GCM (IV aleatorio por cada cifrado) y se sube en base64.
- El servidor sólo ve la columna `snapshot text` con bytes opacos.
  La RLS garantiza que sólo miembros del `share_id` pueden leer/escribir.

Ver [`src/lib/sync.svelte.ts`](src/lib/sync.svelte.ts) para los detalles.

### Sharing de listas

- Cada usuario tiene su lista personal `personal:<userId>` por defecto.
- `joinShare(shareId)` añade al usuario actual a la membresía de otra lista.
- Para compartir: pasa tu `share_id` (visible en el panel 📡) Y la passphrase
  por un canal externo (WhatsApp, en persona…). Quien los tenga puede leer
  tus datos; sin la passphrase, el `share_id` solo no sirve.

## Estructura del repo

```
src/
├── components/
│   ├── auth/           # ProfileSetup, PinGate
│   ├── list/           # StoreGrid, StoreCard, StoreEditor, ListView
│   ├── ui/             # ThemeToggle, BackupModal, SyncDiag
│   └── AppShell.svelte
├── layouts/Layout.astro
├── lib/
│   ├── data/
│   │   ├── storeTypes.ts        # 14 tipos
│   │   ├── stores.ts            # 24 tiendas seed
│   │   ├── categories.ts        # ~70 categorías
│   │   └── products/            # ~900 productos en archivos por área
│   ├── stores/app.svelte.ts     # estado global (Svelte 5 runes)
│   ├── storage.ts               # LocalStorage + PIN hash
│   ├── backup.ts                # código de backup (gzip+base64url)
│   ├── supabase.ts              # cliente Supabase
│   ├── sync.svelte.ts           # sync + AES-GCM + Realtime + sharing
│   ├── base.ts                  # helper para BASE_URL en GH Pages
│   └── types.ts
├── pages/
│   ├── index.astro
│   └── lista/[storeId].astro
└── styles/global.css

public/logos/          # PNGs/SVGs de las cadenas
.github/workflows/     # deploy automático a Pages
homeassistant/         # YAML de ejemplo (sólo en modo SSR)
```

## Catálogo de productos

Cubierto al detalle (~30-50 productos por sección):

- **Supermercado**: Frutería, Carnicería, Pescadería, Lácteos, Charcutería,
  Despensa, Congelados, Bebidas (incluye ~55 vinos por origen),
  Snacks, Desayuno, Higiene, Bebé, Mascotas, Limpieza, Panadería.
- **Carnicería especializada**: Vacuno, Cerdo, Cordero, Aves, Embutidos,
  Preparados.
- **Pescadería especializada**: Pescado fresco, Marisco, Conservas/ahumados.
- **Panadería especializada**: Pan, Bollería, Tartas y postres.
- **Farmacia**: Medicación, Cuidado, Bebé.
- **Perfumería**: Fragancias, Maquillaje, Cuidado, Cabello.
- **Ferretería**: Herramientas, Tornillería, Electricidad, Fontanería,
  Pintura, Jardín.
- **Ropa**: Mujer, Hombre, Niño/a, Calzado, Accesorios.
- **Hogar**: Cocina, Baño, Decoración, Textil.
- **Centro Comercial, Delicatessen, Herboristería, Locutorio**.

Sabor local: txuleta de buey, kokotxas de merluza/bacalao, perretxikos,
chipirones, anchoas de Santoña, idiazabal, txakoli de Getaria/Bizkaia/Álava,
sidra natural, morcilla de Beasain, pantxineta, goxua, jamón ibérico de
bellota, fabes asturianas, alubias de Tolosa, pimentón de la Vera,
turrón de Jijona/Alicante, polvorones, mantecados…

## Roadmap

- [x] Catálogo extenso con productos típicos
- [x] Editor visual de tiendas (crear/editar/borrar con PIN)
- [x] Subida de foto personalizada para tiendas
- [x] Backup en código (sin servidor)
- [x] GitHub Actions → Pages
- [x] Sync online (Supabase + AES-GCM + Realtime + sharing)
- [ ] Editor visual de productos del catálogo
- [ ] Foto personalizada por producto
- [ ] Endpoints SSR para escritura desde Home Assistant
- [ ] PWA con service worker + offline real
- [ ] Modo "ruta de compra" (orden de items por pasillos)

## Licencia

MIT
