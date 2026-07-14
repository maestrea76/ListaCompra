# 🛒 Tu Compra

Aplicación web de listas de la compra **multi-tienda** con sincronización
**100% local** a través de Home Assistant. Pensada y seedeada para hábitos de
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
- 👤 **Perfil local sin fricción**: sólo nombre. Los datos viven en
  LocalStorage. Sin servidor obligatorio para uso single-device.
- 🏠 **Sincronización 100% local con Home Assistant** (integración instalable
  vía HACS). Sin servicios externos: los datos viven en tu propio HA.
  - Identidad = tu usuario de HA (entidades `person.`), sin login ni passphrase.
  - Multi-dispositivo: tus listas siempre al día en móvil + portátil.
  - Multi-usuario: listas **personales** o **compartidas** entre usuarios de HA
    (las compartidas las gestiona un administrador).
- 🌙 **Tema claro/oscuro** persistido por usuario.
- 📱 **Mobile-first**, PWA-ready (manifest + favicon).
- 🚀 **GitHub Pages** vía Actions (deploy automático en cada push a `main`).

## Stack

- [Astro 5](https://astro.build/) + [Svelte 5](https://svelte.dev/) (runes)
- [Tailwind CSS v4](https://tailwindcss.com/) con tema inline
- TypeScript estricto
- [Home Assistant](https://www.home-assistant.io/) — integración local
  (`custom_components/tucompra`) distribuida por [HACS](https://hacs.xyz/)

## Instalación en Home Assistant (HACS)

1. En HACS → menú ⋮ → **Repositorios personalizados**, añade
   `https://github.com/maestrea76/ListaCompra` como tipo **Integración**.
2. Instala **Tu Compra** y **reinicia** Home Assistant.
3. Añade la línea `tucompra:` a tu `configuration.yaml` y reinicia.
4. Aparecerá **Tu Compra** en la barra lateral. La identidad es tu usuario de
   HA; las listas se guardan en `.storage/tucompra`.

> Las listas compartidas se crean desde el panel de sincronización (icono de
> estado bajo tu nombre) por cualquier usuario **administrador** de HA.

> **Los usuarios no compilan nada.** Cada Release lo construye GitHub Actions:
> al empujar un tag `vX.Y.Z`, el workflow compila el panel, lo empaqueta en
> `tucompra.zip` y lo publica como asset del Release. HACS descarga ese asset
> (`zip_release`), así que instalar/actualizar es un clic.

### Publicar una versión (solo el desarrollador)

```bash
git tag v0.3.1 && git push origin v0.3.1
```

CI se encarga del resto. Para probar el panel en local sin HA:

```bash
npm install
npm run build:ha   # genera custom_components/tucompra/panel/app
```

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
Cloudflare Pages…).

## Sincronización con Home Assistant

La sincronización es **100% local**: los datos viven en tu propio HA
(`.storage/tucompra`), sin servicios externos. Instalando la integración
(ver [Instalación en Home Assistant](#instalación-en-home-assistant-hacs))
aparece "Tu Compra" en la barra lateral.

### Cómo funciona

- La SPA se sirve **desde el propio HA** dentro del panel. Un pequeño web
  component (`tucompra-panel.js`) la incrusta en un iframe y le entrega el
  **token de acceso del usuario logueado en HA** por `postMessage`.
- Con ese token la app llama a `/api/tucompra/*`, autenticada como ese usuario.
  La identidad se resuelve con `request["hass_user"]` y se mapea a la entidad
  `person.` correspondiente (para nombre y foto). **Sin login ni passphrase.**
- Cada dispositivo mantiene su copia local (LocalStorage) y sincroniza contra
  HA (pull periódico + push al editar), reconciliando por `updatedAt`. Offline
  sigue funcionando y sincroniza al recuperar HA.

Ver [`src/lib/sync.svelte.ts`](src/lib/sync.svelte.ts) (cliente) y
[`custom_components/tucompra/`](custom_components/tucompra/) (backend).

### Listas personales y compartidas

- Cada usuario tiene su **lista personal** (`personal:<user_id>`) por defecto.
- Un **administrador** de HA puede crear **listas compartidas**, ponerles
  nombre (p.ej. "Hogar") y elegir miembros entre las personas de HA. Compartir
  da acceso a **toda** la cuenta de esa lista (tiendas + productos + items).
- Cambias de lista activa desde el panel de estado (icono bajo tu nombre).

## Añadir productos por voz

### Servicio `tucompra.add_item`
La integración expone un servicio que añade un producto **por su nombre** y lo
**enruta a la tienda** adecuada: reconoce el producto con búsqueda difusa, deduce
su tipo de tienda y lo coloca en la **tienda por defecto** de ese tipo (ajustable
con el botón 🎯). Si no puede clasificarlo, va a la bandeja **"📥 Por clasificar"**.

```yaml
action: tucompra.add_item
data:
  name: papel higiénico
  quantity: 2
```

Sirve directamente para **Assist de HA** (móvil, Voice PE) y como base del puente
con Google.

### Puente con Google Keep (Google Nest)
Con esto, *"Ok Google, añade papel higiénico a la lista de la compra"* acaba
clasificado en Tu Compra. La integración lee tu lista de Google Keep, importa los
ítems y los **borra de Keep** tras importarlos.

1. Obtén un **token maestro** de tu cuenta de Google (necesario para `gkeepapi`;
   se hace una vez con la utilidad `gpsoauth`/token de Google — busca "gkeepapi
   master token"). ⚠️ Da acceso completo a tu Keep: guárdalo en `secrets.yaml`.
2. Configura en `configuration.yaml`:

```yaml
tucompra:
  google_keep:
    email: !secret google_email
    master_token: !secret google_keep_token
    # list_name: "Lista de la compra"   # opcional; por defecto detecta la de la compra
    # interval: 120                       # opcional, segundos entre sondeos
    # share_id: "shared:abc123"           # opcional; por defecto la compartida/personal
```

3. Reinicia HA. Cada `interval` segundos importará lo nuevo.

> **Nota**: `gkeepapi` es una librería **no oficial**; si Google cambia algo puede
> dejar de funcionar. Es el único modo de leer la lista de la compra nativa del
> Assistant.

## Estructura del repo

```
src/
├── components/
│   ├── auth/           # ProfileSetup
│   ├── list/           # StoreGrid, StoreCard, StoreEditor, ListView
│   ├── ui/             # ThemeToggle, SyncDiag
│   └── AppShell.svelte
├── layouts/Layout.astro
├── lib/
│   ├── data/
│   │   ├── storeTypes.ts        # 14 tipos
│   │   ├── stores.ts            # 24 tiendas seed
│   │   ├── categories.ts        # ~70 categorías
│   │   └── products/            # ~900 productos en archivos por área
│   ├── stores/app.svelte.ts     # estado global (Svelte 5 runes)
│   ├── storage.ts               # LocalStorage
│   ├── sync.svelte.ts           # sync contra la API local de Home Assistant
│   ├── base.ts                  # helper para BASE_URL en GH Pages
│   └── types.ts
├── pages/
│   ├── index.astro
│   └── lista/[storeId].astro
└── styles/global.css

public/logos/          # PNGs/SVGs de las cadenas
custom_components/tucompra/    # integración HA (API + panel + storage)
│   ├── __init__.py            # registra panel, estáticos y API
│   ├── api.py                 # vistas REST autenticadas (hass_user)
│   ├── store.py               # persistencia en .storage/tucompra + shares
│   ├── const.py / manifest.json
│   └── panel/                 # wrapper + build de la SPA (npm run build:ha)
hacs.json              # metadatos para instalación vía HACS
.github/workflows/     # deploy automático a Pages
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
- [x] Editor visual de tiendas (crear/editar/borrar)
- [x] Subida de foto personalizada para tiendas
- [x] Backup en código (sin servidor)
- [x] GitHub Actions → Pages
- [x] Integración local con Home Assistant (HACS): API + panel + shares
- [ ] config_flow para instalar desde la UI de HA (sin `configuration.yaml`)
- [ ] Entidades `todo.*` para Assist / Google Nest por voz
- [ ] Editor visual de productos del catálogo
- [ ] Foto personalizada por producto
- [ ] PWA con service worker + offline real
- [ ] Modo "ruta de compra" (orden de items por pasillos)

## Licencia

MIT
