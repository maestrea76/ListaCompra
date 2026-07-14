# 🛒 Tu Compra

Aplicación web de listas de la compra **multi-tienda** con sincronización
**100% local** a través de Home Assistant. El catálogo se **adapta a la cultura**
según el idioma de HA (🇪🇸🇬🇧🇺🇸🇫🇷🇩🇪). El seed español es el más completo, con
fuerte sabor de **Euskadi / País Vasco** (txuleta, kokotxas, txakoli, idiazabal,
perretxikos…) y resto de España (jamón ibérico, fabes, turrón de Jijona…).

🔗 Demo: https://maestrea76.github.io/ListaCompra/

## Características principales

- 🌍 **Multi-cultura según el idioma de Home Assistant**: tiendas y catálogo se
  adaptan solos al idioma/país de HA. 🇪🇸 España (Eroski, Mercadona…),
  🇬🇧 UK (Tesco, Sainsbury's, Boots…), 🇺🇸 USA (Walmart, Costco, Kroger…),
  🇫🇷 Francia (Carrefour, Leclerc, Monoprix…), 🇩🇪 Alemania (Aldi, Rewe, Edeka…),
  con productos y nombres de categoría típicos de cada país. Una **bandera**
  junto al selector de tema indica el idioma detectado.
- 🏪 **Tiendas predefinidas** con logos reales o badges de color; añade / edita /
  borra desde la UI con un editor visual. El catálogo español es el más completo
  (~900 productos); los demás locales parten de un set curado y se amplían.
- 📦 **Catálogo** organizado en jerarquía TipoTienda → Categoría → Producto.
  Cada producto con icono emoji, cantidad y unidad (unidad / kg / g / l / ml /
  paquete / docena / caja).
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

## Añadir productos por voz (Assist)

La integración expone el servicio **`tucompra.add_item`**, que añade un producto
**por su nombre** y lo **enruta a la tienda** adecuada: lo reconoce con búsqueda
difusa, deduce su tipo de tienda y lo coloca en la **tienda por defecto** de ese
tipo (ajustable con el botón 🎯). Si no puede clasificarlo, va a la bandeja
**"📥 Por clasificar"**, desde donde lo recolocas con un toque (botón ↪).

```yaml
action: tucompra.add_item
data:
  name: papel higiénico
  quantity: 2
```

Al ser un servicio de HA, funciona con **Assist** (móvil, Voice PE, etc.). Para
dispararlo por voz basta una frase personalizada que llame al servicio, p. ej. en
`configuration.yaml`:

```yaml
intent_script:
  AddShoppingItem:
    action:
      - action: tucompra.add_item
        data:
          name: "{{ item }}"
    speech:
      text: "Añadido {{ item }} a la lista"
```

```yaml
# custom_sentences/es/tucompra.yaml
language: "es"
intents:
  AddShoppingItem:
    data:
      - sentences:
          - "(añade|agrega|apunta|pon|mete) {item} a la (lista|compra|lista de la compra)"
          - "(añade|agrega|apunta|pon|mete) {item} en la (lista|compra|lista de la compra)"
lists:
  item:
    wildcard: true
```

Así, *"Oye Nabu, añade papel higiénico a la compra"* lo clasifica en su tienda.

> ⚠️ Las `custom_sentences` solo las reconoce el agente de conversación
> **"Home Assistant"**. Si usas un agente LLM (Gemini, ChatGPT…), cámbialo a
> "Home Assistant" en el diálogo de Assist, o activa **"Preferir gestionar
> comandos localmente"** en los ajustes de ese asistente.

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
│   │   ├── stores.ts            # tiendas seed (ES)
│   │   ├── categories.ts        # ~70 categorías
│   │   ├── products/            # ~900 productos ES en archivos por área
│   │   └── locales/            # tiendas/productos/labels por cultura (UK/US/FR/DE)
│   ├── i18n/locale.ts          # idioma+país de HA → locale + bandera
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
- [ ] Entidades `todo.*` para Assist por voz
- [ ] Editor visual de productos del catálogo
- [ ] Foto personalizada por producto
- [ ] PWA con service worker + offline real
- [ ] Modo "ruta de compra" (orden de items por pasillos)

## Licencia

MIT
