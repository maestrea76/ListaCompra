# 🛒 Tu Compra — Supermarket & Grocery Shopping Lists for Home Assistant

**Tu Compra** ("My Shopping") is a **multi-store supermarket / grocery shopping
list** that runs **100% locally inside Home Assistant**. No cloud, no accounts,
no subscriptions: your lists live in your own HA instance, and your identity is
simply the Home Assistant user you are already logged in as.

It adds a **Tu Compra** panel to your Home Assistant sidebar, with a visual,
mobile-first interface designed for actually using it while walking around a
supermarket.

🔗 Live demo (browser only, no HA): https://maestrea76.github.io/ListaCompra/

---

## Why this instead of a plain to-do list?

A single flat shopping list breaks down the moment your shopping is spread
across several shops. Tu Compra is built around the way people really shop:

- **One list per store.** Milk goes on the supermarket list, screws go on the
  hardware store list, and each list only shows what belongs there.
- **A real product catalog.** Hundreds of pre-loaded products per country,
  organised by store type and section — you tap instead of typing.
- **Quantities and units.** Each item carries an amount and a unit
  (unit / kg / g / l / ml / pack / dozen / box), editable inline.
- **Learns your habits.** The products you add most often in a given store are
  surfaced first as "your usuals", so a weekly shop is a handful of taps.

## Key features

- 🌍 **Culture-aware catalog.** Stores and products adapt automatically to your
  Home Assistant language and country:
  - 🇪🇸 **Spain** — Eroski, Mercadona, Lidl, Día, Carrefour, Alcampo, BM…
  - 🇬🇧 **United Kingdom** — Tesco, Sainsbury's, Asda, Morrisons, Waitrose, Boots…
  - 🇺🇸 **United States** — Walmart, Costco, Target, Kroger, Safeway, Trader Joe's…
  - 🇫🇷 **France** — Carrefour, Leclerc, Auchan, Intermarché, Monoprix…
  - 🇩🇪 **Germany** — Aldi, Lidl, Rewe, Edeka, Kaufland, dm…
  - 🇧🇷 **Brazil** — Pão de Açúcar, Assaí, Atacadão, Extra, Renner…
  
  Each locale ships genuinely local products (Marmite and Hobnobs for the UK,
  ranch and tater tots for the US, Comté and rillettes for France, Quark and
  Brezel for Germany, farofa and guaraná for Brazil), plus translated section
  names. A **flag** next to the theme switch shows the detected locale.
- 🏪 **Visual store editor.** Add, edit, reorder, hide or delete stores from the
  UI. Upload your own photo for a store, or use the built-in colour badges.
- 🔍 **Fuzzy search.** Accent-insensitive and typo-tolerant: "platano" finds
  "Plátano", "detrgente" finds "Detergente". If a product doesn't exist, press
  **Enter** to create it on the fly.
- 🗣️ **Voice input via Assist.** Say what you need and it lands in the right
  store's list automatically (see [Voice](#voice-input-with-assist)).
- 👥 **Personal and shared lists.** Keep your own list, or share a household
  list between several Home Assistant users.
- 🔒 **Fully local.** Data is stored in your Home Assistant (`.storage`), never
  sent anywhere else. Works offline and re-syncs when HA is reachable again.
- 🌙 **Light / dark theme**, mobile-first, large tap targets.

---

## Installation (HACS)

1. In **HACS** → ⋮ menu → **Custom repositories**, add
   `https://github.com/maestrea76/ListaCompra` with category **Integration**.
2. Install **Tu Compra** and **restart** Home Assistant.
3. Add this line to your `configuration.yaml`:

   ```yaml
   tucompra:
   ```

4. Restart Home Assistant again.
5. **Tu Compra** now appears in your sidebar.

That's the whole setup — there is nothing else to configure. No account, no API
key, no passphrase.

> **Requirements:** Home Assistant **2024.7+**. For the integration icon to be
> displayed, Home Assistant **2026.3+** is required (local brand images).

---

## How it works

The panel is served by your own Home Assistant instance and authenticates as the
HA user who is currently logged in:

- Your **identity** is your Home Assistant user, mapped to the matching
  `person.` entity (for your display name and picture). There is **no login and
  no passphrase** inside the app — if you can open Home Assistant, you are in.
- Your lists are stored **inside Home Assistant** (`.storage/tucompra`) and are
  included in your regular Home Assistant backups.
- Every device keeps a **local copy** and syncs against Home Assistant (periodic
  pull, push on edit), reconciling by timestamp. You can keep ticking items off
  **offline** in the shop; it syncs as soon as HA is reachable again.
- Nothing is sent to any external service. There are no third-party
  dependencies, no telemetry and no cloud account.

### Personal and shared lists

- Every user automatically gets a **personal list**.
- A Home Assistant **administrator** can create **shared lists** (e.g. "Home"),
  give them a name and pick members from the household's `person.` entities.
  Sharing gives members access to the whole list account: stores, custom
  products and items.
- If you are a member of a shared list, it becomes your **default** list — the
  household list is what you normally want when you open the app.
- Switch between your lists from the sync panel (the status chip under your
  name).

---

## Voice input with Assist

The integration exposes a **`tucompra.add_item`** service that adds a product
**by name** and **routes it to the correct store automatically**:

1. It recognises the product with fuzzy search across the catalog.
2. From the product it derives the **store type** (milk → supermarket, chops →
   butcher, ibuprofen → pharmacy…).
3. It puts the item in your **default store** for that type.
4. If it cannot decide (unknown product, or several stores of that type with no
   default), the item goes to the **"📥 To sort"** tray, where one tap (the ↪
   button) sends it to the right store.

You never have to say the store out loud — the product itself implies it.

### Default stores

If you have several shops of the same type (three supermarkets, say), open the
**🎯 button** in the header and choose which one is the default for each type.
Types with a single store are resolved automatically.

### Testing the service

Home Assistant → **Developer tools → Actions**:

```yaml
action: tucompra.add_item
data:
  name: toilet paper
  quantity: 2
```

### Wiring it to Assist

Add an intent to `configuration.yaml`:

```yaml
intent_script:
  AddShoppingItem:
    action:
      - action: tucompra.add_item
        data:
          name: "{{ item }}"
    speech:
      text: "Added {{ item }} to the list"
```

And create `custom_sentences/en/tucompra.yaml` in your config folder:

```yaml
language: "en"
intents:
  AddShoppingItem:
    data:
      - sentences:
          - "(add|put) {item} to the (list|shopping list)"
          - "(add|put) {item} on the (list|shopping list)"
lists:
  item:
    wildcard: true
```

Restart Home Assistant, then say or type in Assist:

> *"add toilet paper to the shopping list"*

> ⚠️ **Custom sentences are only understood by the "Home Assistant" conversation
> agent.** If you use an LLM agent (Gemini, ChatGPT…), either switch the agent to
> "Home Assistant" in the Assist dialog, or enable **"Prefer handling commands
> locally"** in that assistant's settings.

---

## The catalog

Products are organised as **Store type → Section → Product**, and every section
ends with an "Other" entry for flexibility.

The **Spanish catalog is the deepest** (~1,300 products), covering supermarket
sections in detail (produce, butcher, fishmonger, dairy, deli, pantry, frozen,
drinks — including ~55 wines by origin — snacks, breakfast, hygiene, baby, pets,
cleaning, bakery) plus specialised shops: butcher, fishmonger, bakery, pharmacy,
perfumery, hardware, clothing, home, shopping centre, delicatessen, herbalist.
It has a strong Basque Country / Spanish flavour (txuleta, kokotxas, txakoli,
idiazabal, perretxikos, jamón ibérico, turrón de Jijona…).

The **UK, US, French, German and Brazilian catalogs** ship 245–390 curated
products each, covering the full weekly shop across every supermarket section.
They keep growing — and in any case the fuzzy search plus "press Enter to
create" means nothing is ever blocked by a missing product.

---

## Roadmap

- [x] Extensive catalog with typical products
- [x] Visual store editor (create / edit / delete)
- [x] Custom photo upload for stores
- [x] Local Home Assistant integration (HACS): API + panel + shared lists
- [x] Culture-aware catalog by HA language (🇪🇸🇬🇧🇺🇸🇫🇷🇩🇪🇧🇷) + SVG flag
- [x] Voice via Assist: `tucompra.add_item` service with automatic store routing
- [x] "To sort" tray with one-tap triage to the right store
- [x] Integration icon bundled (shown on install)
- [x] Button to open the HA sidebar from the panel
- [ ] Config flow (set up from the HA UI, no `configuration.yaml`)
- [ ] `todo.*` entities (native HA To-do card)
- [ ] Visual editor for catalog products
- [ ] Custom photo per product
- [ ] PWA with service worker + true offline
- [ ] "Shopping route" mode (order items by aisle)

---

# 🇪🇸 Español

**Tu Compra** es una aplicación de **listas de la compra multi-tienda** que
funciona **100% en local dentro de Home Assistant**. Sin nube, sin cuentas y sin
suscripciones: los datos viven en tu propio HA y tu identidad es simplemente el
usuario de Home Assistant con el que ya has entrado.

El catálogo se **adapta a la cultura** según el idioma de HA (🇪🇸🇬🇧🇺🇸🇫🇷🇩🇪🇧🇷).
El seed español es el más completo (~1.300 productos), con fuerte sabor de
**Euskadi / País Vasco** (txuleta, kokotxas, txakoli, idiazabal, perretxikos…) y
del resto de España (jamón ibérico, fabes, turrón de Jijona…).

## Características principales

- 🌍 **Multi-cultura**: tiendas y productos según el idioma/país de HA
  (Eroski/Mercadona, Tesco, Walmart, Carrefour, Aldi, Pão de Açúcar…), con
  secciones traducidas y una **bandera** junto al selector de tema.
- 🏪 **Editor visual de tiendas**: crear, editar, ocultar, borrar y foto propia.
- 🔍 **Búsqueda difusa**: sin acentos y tolerante a erratas. Si no existe,
  **Enter** crea el producto.
- 🗣️ **Voz con Assist**: `tucompra.add_item` reconoce el producto, deduce su tipo
  de tienda y lo coloca en la **tienda por defecto** (botón 🎯). Si duda, va a la
  bandeja **"📥 Por clasificar"** y lo recolocas con el botón ↪.
- 👥 **Listas personales y compartidas** entre usuarios de HA (las compartidas
  las crea un **administrador**; si perteneces a una, es tu lista por defecto).
- 🔒 **Todo local**: los datos viven en `.storage` de tu HA y entran en tus
  backups. Funciona offline y sincroniza al recuperar HA.
- 🌙 **Tema claro/oscuro**, mobile-first.

## Instalación (HACS)

1. HACS → ⋮ → **Repositorios personalizados**: añade
   `https://github.com/maestrea76/ListaCompra` como **Integración**.
2. Instala **Tu Compra** y **reinicia** Home Assistant.
3. Añade a `configuration.yaml`:

   ```yaml
   tucompra:
   ```

4. Reinicia otra vez. Aparecerá **Tu Compra** en la barra lateral.

No hay nada más que configurar: ni cuenta, ni API key, ni passphrase.

> **Requisitos:** Home Assistant **2024.7+**. Para que se vea el icono de la
> integración hace falta **2026.3+**.

## Voz con Assist

En `configuration.yaml`:

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

Y en `custom_sentences/es/tucompra.yaml`:

```yaml
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

Reinicia HA y di: *"añade papel higiénico a la compra"*.

> ⚠️ Las `custom_sentences` solo las reconoce el agente **"Home Assistant"**. Con
> un agente LLM (Gemini, ChatGPT…), cámbialo a "Home Assistant" o activa
> **"Preferir gestionar comandos localmente"**.

---

## License

MIT
