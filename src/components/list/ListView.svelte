<script lang="ts">
  // Vista de la lista de una tienda concreta.
  // - Búsqueda combinada por categoría/sección + texto
  // - Crea producto libre con Enter si no hay match
  // - Cada item de la lista permite ajustar cantidad (+/-) y cambiar unidad
  //   sin abandonar la pantalla.

  import { onMount } from 'svelte';
  import { app } from '$lib/stores/app.svelte';
  import { base } from '$lib/base';
  import type { Unit } from '$lib/types';
  import MenuButton from '../ui/MenuButton.svelte';

  let { storeId }: { storeId: string } = $props();

  let query = $state('');
  let activeCat = $state<string | 'all'>('all');
  // Item cuyo selector "mover a otra tienda" está abierto (triaje de bandeja).
  let movingItemId = $state<string | null>(null);

  const INBOX_ID = 'inbox';

  const UNITS: Unit[] = ['unidad', 'kg', 'g', 'l', 'ml', 'paquete', 'docena', 'caja'];

  // Comparador alfabético en español que deja "Otros" siempre al final.
  const byName = (a: { name: string }, b: { name: string }) => {
    const aOtros = /^otros$/i.test(a.name.trim());
    const bOtros = /^otros$/i.test(b.name.trim());
    if (aOtros !== bOtros) return aOtros ? 1 : -1;
    return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
  };

  // Cuántos productos "habituales" mostramos cuando no hay búsqueda.
  const HABITUALES_LIMIT = 20;

  // Normaliza texto para búsquedas tolerantes: minúsculas + sin acentos/diacríticos.
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // ¿Aparecen los caracteres de `needle` en orden dentro de `hay`?
  // (coincidencia por subsecuencia → tolera letras intercaladas y typos leves).
  const isSubsequence = (needle: string, hay: string) => {
    let i = 0;
    for (let j = 0; j < hay.length && i < needle.length; j++) {
      if (hay[j] === needle[i]) i++;
    }
    return i === needle.length;
  };

  // Puntúa cómo de bien casa `name` con la consulta `q` (ya normalizados).
  // Mayor = mejor. -1 = no casa. Criterios, de más a menos fuerte:
  //  4 nombre empieza por la consulta · 3 contiene la consulta entera ·
  //  2 todas las palabras de la consulta aparecen · 1 subsecuencia difusa.
  const scoreMatch = (name: string, q: string): number => {
    if (name.startsWith(q)) return 4;
    if (name.includes(q)) return 3;
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length > 1 && words.every((w) => name.includes(w))) return 2;
    if (isSubsequence(q.replace(/\s+/g, ''), name)) return 1;
    return -1;
  };

  onMount(() => app.hydrate());

  const store = $derived(app.state.stores.find((s) => s.id === storeId));
  const list = $derived(app.state.lists[storeId] ?? { storeId, items: [], updatedAt: 0 });

  // Categorías disponibles para el tipo de tienda actual, ordenadas A-Z.
  const categories = $derived(
    store
      ? app.state.categories
          .filter((c) => c.typeId === store.typeId)
          .slice()
          .sort(byName)
      : [],
  );

  const productsForType = $derived.by(() => {
    if (!store) return [];
    const catIds = new Set(categories.map((c) => c.id));
    return app.state.products.filter((p) => catIds.has(p.categoryId));
  });

  // Sugerencias bajo el buscador. Tres modos:
  //  - Con texto: busca en todo el catálogo del tipo de tienda (incluso si
  //    hay categoría activa, busca dentro de ella).
  //  - Sin texto + categoría: muestra los habituales de esa categoría, y si
  //    no hay habituales, los primeros 12 alfabéticos como fallback.
  //  - Sin texto + 'Todas': sólo los habituales del usuario en esta tienda.
  //    Si nunca ha comprado nada, sale vacío y el usuario usa la búsqueda.
  const filtered = $derived.by(() => {
    let pool = productsForType;
    if (activeCat !== 'all') pool = pool.filter((p) => p.categoryId === activeCat);

    const q = norm(query.trim());
    if (q) {
      // Búsqueda tolerante: puntuamos cada producto y nos quedamos con los
      // que casan (score >= 0), ordenados por relevancia y luego alfabético.
      return pool
        .map((p) => ({ p, score: scoreMatch(norm(p.name), q) }))
        .filter((x) => x.score >= 0)
        .sort((a, b) => b.score - a.score || byName(a.p, b.p))
        .slice(0, 60)
        .map((x) => x.p);
    }

    // Sin texto: ordenamos por uso descendente y cogemos los top.
    const habituales = pool
      .map((p) => ({ p, count: app.usageCount(storeId, p.id) }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count || byName(a.p, b.p))
      .slice(0, HABITUALES_LIMIT)
      .map((x) => x.p);

    if (habituales.length > 0) return habituales;

    // Fallback: si hay categoría activa pero el usuario no ha comprado nada
    // ahí todavía, mostramos los primeros 12 alfabéticos para arrancar.
    if (activeCat !== 'all') {
      return pool.slice().sort(byName).slice(0, HABITUALES_LIMIT);
    }
    return [];
  });

  const showingHabituales = $derived(query.trim() === '' && filtered.length > 0);

  // Lista actual agrupada por categoría, categorías y productos en orden A-Z.
  const grouped = $derived.by(() => {
    const byCat = new Map<string, typeof list.items>();
    for (const it of list.items) {
      const product = app.state.products.find((p) => p.id === it.productId);
      const catId = product?.categoryId ?? 'unknown';
      if (!byCat.has(catId)) byCat.set(catId, []);
      byCat.get(catId)!.push(it);
    }
    return [...byCat.entries()]
      .map(([catId, items]) => ({
        category: app.state.categories.find((c) => c.id === catId),
        items: items.slice().sort((a, b) => {
          const pa = app.state.products.find((p) => p.id === a.productId)?.name ?? '';
          const pb = app.state.products.find((p) => p.id === b.productId)?.name ?? '';
          return pa.localeCompare(pb, 'es', { sensitivity: 'base' });
        }),
      }))
      .sort((a, b) =>
        (a.category?.name ?? '~').localeCompare(b.category?.name ?? '~', 'es', { sensitivity: 'base' }),
      );
  });

  function addProduct(productId: string) {
    const p = app.state.products.find((x) => x.id === productId);
    app.addItem(storeId, {
      productId,
      qty: 1,
      unit: p?.defaultUnit ?? 'unidad',
    });
    query = '';
  }

  /** Enter: si no hay match, crea producto libre y lo añade. */
  function handleQueryKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = query.trim();
    if (!q || !store) return;
    const exact = productsForType.find((p) => norm(p.name) === norm(q));
    if (exact) return addProduct(exact.id);
    if (filtered.length > 0) return addProduct(filtered[0].id);
    const created = app.createFreeProduct(q, store.typeId);
    addProduct(created.id);
  }

  function product(id: string) {
    return app.state.products.find((p) => p.id === id);
  }

  function step(itemId: string, delta: number) {
    const it = list.items.find((i) => i.id === itemId);
    if (!it) return;
    app.setItemQty(storeId, itemId, it.qty + delta);
  }

  const isInbox = $derived(storeId === INBOX_ID);

  // Tiendas a las que mover (todas menos la actual), "Otros" al final.
  const moveTargets = $derived(
    app.state.stores.filter((s) => s.enabled !== false && s.id !== storeId).slice().sort(byName),
  );

  // Tienda sugerida para un producto (categoría → tipo → default), o null.
  function suggestedStore(productId: string) {
    const id = app.suggestStoreFor(productId);
    if (!id || id === storeId) return null;
    return app.state.stores.find((s) => s.id === id) ?? null;
  }

  function moveTo(itemId: string, toStoreId: string) {
    if (!toStoreId) return;
    app.moveItem(storeId, itemId, toStoreId);
    movingItemId = null;
  }

  const doneCount = $derived(list.items.filter((i) => i.done).length);

  function clearDone() {
    if (doneCount === 0) {
      alert('No hay productos marcados como comprados.');
      return;
    }
    if (!confirm(`¿Eliminar los ${doneCount} producto(s) marcados como comprados?`)) return;
    app.clearDone(storeId);
  }

  function clearAll() {
    if (list.items.length === 0) return;
    if (!confirm(`¿Vaciar la lista entera (${list.items.length} producto(s))? Esta acción no se puede deshacer.`)) return;
    for (const it of [...list.items]) app.removeItem(storeId, it.id);
  }
</script>

{#if !store}
  <p>Tienda no encontrada.</p>
{:else}
  <div class="space-y-5">
    <!-- Header en 2 filas en móvil para que el nombre largo y los botones no
         provoquen scroll horizontal. -->
    <header class="space-y-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 shrink-0">
          <MenuButton />
          <a href="#/" class="text-sm text-muted hover:underline">← Tiendas</a>
        </div>
        <div class="flex gap-1 shrink-0">
          <button onclick={clearDone}
            disabled={doneCount === 0}
            class="text-xs rounded-full border px-3 py-1.5 hover:bg-[var(--bg)] transition disabled:opacity-40"
            style="border-color: var(--border);"
            title="Borrar productos marcados como comprados">
            🧹 Limpiar comprados {doneCount > 0 ? `(${doneCount})` : ''}
          </button>
          <button onclick={clearAll}
            disabled={list.items.length === 0}
            class="text-xs rounded-full border px-3 py-1.5 hover:bg-[var(--bg)] transition disabled:opacity-40"
            style="border-color: var(--border); color: #dc2626;"
            title="Vaciar la lista entera">
            🗑️
          </button>
        </div>
      </div>
      <h2 class="text-xl font-bold flex items-center gap-2 min-w-0">
        {#if store.icon.kind === 'image'}
          <img src={store.icon.value.startsWith('data:') ? store.icon.value : base(store.icon.value)}
            alt="" class="size-7 object-contain shrink-0" />
        {:else if store.icon.kind === 'emoji'}
          <span class="shrink-0">{store.icon.value}</span>
        {/if}
        <span class="truncate">{store.name}</span>
      </h2>
    </header>

    <!-- Buscador + secciones + habituales. Bloque FIJO (sticky) al hacer
         scroll vertical: así no pierdes las categorías ni los recientes al
         navegar por una lista larga. El -mx-4/px-4 extiende el fondo para
         cubrir el padding del contenedor y que los items no asomen por los
         lados al pasar por debajo. -->
    <div class="sticky top-0 z-30 -mx-4 px-4 pt-1 pb-2" style="background: var(--bg);">
    <div class="card-elev p-4 space-y-3">
      <input
        type="text" bind:value={query} placeholder="Buscar o crear producto (Enter)…"
        onkeydown={handleQueryKeydown}
        class="w-full rounded-xl border px-4 py-2.5 bg-transparent"
        style="border-color: var(--border);"
      />

      <!-- Filtro por categoría/sección -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">Sección</span>
          {#if activeCat !== 'all'}
            <button onclick={() => (activeCat = 'all')}
              class="text-xs text-muted hover:underline">limpiar</button>
          {/if}
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth">
          <button onclick={() => (activeCat = 'all')}
            class="shrink-0 w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition"
            class:cat-active={activeCat === 'all'}
            style="border-color: var(--border);">
            <span class="text-2xl">🗂️</span>
            <span class="text-[11px] font-medium leading-tight text-center">Todas</span>
          </button>
          {#each categories as c (c.id)}
            <button onclick={() => (activeCat = c.id)}
              class="shrink-0 w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 px-1 transition"
              class:cat-active={activeCat === c.id}
              style="border-color: var(--border);">
              <span class="text-2xl">{c.icon.kind === 'emoji' ? c.icon.value : '📁'}</span>
              <span class="text-[11px] font-medium leading-tight text-center line-clamp-2">{c.name}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Sugerencias de productos según filtro -->
      {#if filtered.length > 0}
        {#if showingHabituales}
          <p class="text-xs font-semibold uppercase tracking-wider text-muted">
            ⭐ Tus habituales {activeCat !== 'all' ? 'de esta sección' : 'aquí'}
          </p>
        {/if}
        <div class="flex flex-wrap gap-2">
          {#each filtered as p (p.id)}
            <button onclick={() => addProduct(p.id)}
              class="rounded-full border px-3 py-1.5 text-sm hover:bg-[var(--accent)] hover:text-white transition"
              style="border-color: var(--border);">
              {p.icon.kind === 'emoji' ? p.icon.value : '🏷️'} {p.name}
            </button>
          {/each}
        </div>
        {#if showingHabituales}
          <p class="text-xs text-muted">
            Para encontrar otros productos del catálogo, escribe en la búsqueda.
          </p>
        {/if}
      {:else if query.trim()}
        <p class="text-sm text-muted">
          Sin resultados. Pulsa <kbd class="rounded border px-1.5 py-0.5 text-xs"
            style="border-color: var(--border);">Enter</kbd> para crear "<strong>{query}</strong>".
        </p>
      {:else}
        <p class="text-sm text-muted">
          Aún no has añadido productos aquí. Escribe en la búsqueda o elige una sección.
        </p>
      {/if}
    </div>
    </div>

    {#if isInbox && list.items.length > 0}
      <div class="card-elev p-3 text-sm flex items-start gap-2"
        style="border-left: 3px solid var(--accent);">
        <span class="text-lg leading-none">📥</span>
        <span>Productos añadidos por voz que no se pudieron clasificar solos.
          Toca <strong>↪</strong> en cada uno para enviarlo a su tienda.</span>
      </div>
    {/if}

    <!-- Lista agrupada -->
    {#if list.items.length === 0}
      <p class="text-center text-muted py-12">
        {isInbox ? 'Bandeja vacía 🎉 Todo clasificado.' : 'Lista vacía. Añade productos arriba ⬆️'}
      </p>
    {:else}
      <div class="space-y-4">
        {#each grouped as group (group.category?.id ?? 'x')}
          <section class="card-elev p-4">
            <h3 class="font-semibold mb-3 flex items-center gap-2">
              <span>{group.category?.icon.kind === 'emoji' ? group.category.icon.value : '📁'}</span>
              {group.category?.name ?? 'Sin categoría'}
              <span class="text-xs text-muted ml-auto">{group.items.length}</span>
            </h3>
            <ul class="divide-y" style="border-color: var(--border);">
              {#each group.items as item (item.id)}
                {@const p = product(item.productId)}
                {@const sug = suggestedStore(item.productId)}
                <li class={`flex items-center gap-3 py-2.5 flex-wrap ${item.done ? 'product-done' : ''}`}>
                  <button onclick={() => app.toggleItem(storeId, item.id)}
                    class="size-9 shrink-0 rounded-full border-2 grid place-items-center transition"
                    style={item.done
                      ? 'background: var(--accent); border-color: var(--accent); color: white;'
                      : 'border-color: var(--border);'}>
                    {item.done ? '✓' : ''}
                  </button>
                  <span class="text-2xl shrink-0">
                    {p?.icon.kind === 'emoji' ? p.icon.value : '🏷️'}
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="product-name font-medium truncate">{p?.name ?? '?'}</div>
                    <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                      <button onclick={() => step(item.id, -1)}
                        class="size-7 rounded-full border grid place-items-center hover:bg-[var(--bg)]"
                        style="border-color: var(--border);">−</button>
                      <input type="number" min="0.1" step="0.1" value={item.qty}
                        oninput={(e) => app.setItemQty(storeId, item.id, parseFloat(e.currentTarget.value) || 0)}
                        class="w-14 text-center text-sm rounded-md border px-1 py-0.5 bg-transparent"
                        style="border-color: var(--border);" />
                      <button onclick={() => step(item.id, +1)}
                        class="size-7 rounded-full border grid place-items-center hover:bg-[var(--bg)]"
                        style="border-color: var(--border);">+</button>
                      <select value={item.unit}
                        onchange={(e) => app.setItemUnit(storeId, item.id, e.currentTarget.value as Unit)}
                        class="text-xs rounded-md border px-1.5 py-0.5 bg-transparent"
                        style="border-color: var(--border);">
                        {#each UNITS as u}<option value={u}>{u}</option>{/each}
                      </select>
                    </div>
                  </div>
                  <button onclick={() => (movingItemId = movingItemId === item.id ? null : item.id)}
                    class="text-muted hover:text-current text-lg shrink-0"
                    title="Mover a otra tienda">↪</button>
                  <button onclick={() => app.removeItem(storeId, item.id)}
                    class="text-muted hover:text-red-500 text-2xl shrink-0" title="Quitar">×</button>

                  {#if movingItemId === item.id}
                    <div class="basis-full mt-2 flex items-center gap-2 flex-wrap pl-12">
                      <span class="text-xs text-muted">Mover a:</span>
                      {#if sug}
                        <button onclick={() => moveTo(item.id, sug.id)}
                          class="rounded-full px-3 py-1 text-xs font-medium text-white"
                          style="background: var(--accent);"
                          title="Tienda sugerida">⭐ {sug.name}</button>
                      {/if}
                      <select onchange={(e) => moveTo(item.id, e.currentTarget.value)}
                        class="text-xs rounded-md border px-2 py-1 bg-transparent"
                        style="border-color: var(--border);">
                        <option value="">Elegir tienda…</option>
                        {#each moveTargets as s (s.id)}<option value={s.id}>{s.name}</option>{/each}
                      </select>
                      <button onclick={() => (movingItemId = null)}
                        class="text-xs text-muted hover:underline">cancelar</button>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .cat-active {
    background: var(--accent);
    color: white;
    border-color: var(--accent) !important;
    box-shadow: 0 4px 12px -4px var(--accent);
  }
</style>
