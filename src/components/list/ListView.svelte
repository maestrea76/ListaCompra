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

  let { storeId }: { storeId: string } = $props();

  let query = $state('');
  let qty = $state(1);
  let unit = $state<Unit>('unidad');
  let activeCat = $state<string | 'all'>('all');

  const UNITS: Unit[] = ['unidad', 'kg', 'g', 'l', 'ml', 'paquete', 'docena', 'caja'];

  onMount(() => app.hydrate());

  const store = $derived(app.state.stores.find((s) => s.id === storeId));
  const list = $derived(app.state.lists[storeId] ?? { storeId, items: [], updatedAt: 0 });

  // Categorías disponibles para el tipo de tienda actual
  const categories = $derived(
    store
      ? app.state.categories
          .filter((c) => c.typeId === store.typeId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [],
  );

  const productsForType = $derived.by(() => {
    if (!store) return [];
    const catIds = new Set(categories.map((c) => c.id));
    return app.state.products.filter((p) => catIds.has(p.categoryId));
  });

  // Filtro: por categoría activa (si hay) y por texto (si hay)
  const filtered = $derived.by(() => {
    let pool = productsForType;
    if (activeCat !== 'all') pool = pool.filter((p) => p.categoryId === activeCat);
    const q = query.trim().toLowerCase();
    if (q) pool = pool.filter((p) => p.name.toLowerCase().includes(q));
    return pool.slice(0, 60);
  });

  // Lista actual agrupada por categoría
  const grouped = $derived.by(() => {
    const byCat = new Map<string, typeof list.items>();
    for (const it of list.items) {
      const product = app.state.products.find((p) => p.id === it.productId);
      const catId = product?.categoryId ?? 'unknown';
      if (!byCat.has(catId)) byCat.set(catId, []);
      byCat.get(catId)!.push(it);
    }
    return [...byCat.entries()].map(([catId, items]) => ({
      category: app.state.categories.find((c) => c.id === catId),
      items,
    }));
  });

  function addProduct(productId: string) {
    const p = app.state.products.find((x) => x.id === productId);
    app.addItem(storeId, {
      productId,
      qty: qty || 1,
      unit: unit ?? p?.defaultUnit ?? 'unidad',
    });
    query = '';
  }

  /** Enter: si no hay match, crea producto libre y lo añade. */
  function handleQueryKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const q = query.trim();
    if (!q || !store) return;
    const exact = productsForType.find((p) => p.name.toLowerCase() === q.toLowerCase());
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
</script>

{#if !store}
  <p>Tienda no encontrada.</p>
{:else}
  <div class="space-y-5">
    <header class="flex items-center justify-between">
      <a href={base('/')} class="text-sm text-muted hover:underline">← Tiendas</a>
      <h2 class="text-xl font-bold flex items-center gap-2">
        {#if store.icon.kind === 'image'}
          <img src={base(store.icon.value)} alt="" class="size-7 object-contain" />
        {:else if store.icon.kind === 'emoji'}
          <span>{store.icon.value}</span>
        {/if}
        {store.name}
      </h2>
      <button onclick={() => app.clearDone(storeId)} class="text-xs text-muted hover:underline">
        Limpiar comprados
      </button>
    </header>

    <!-- Buscador + crear -->
    <div class="card-elev p-4 space-y-3">
      <div class="flex gap-2">
        <input
          type="text" bind:value={query} placeholder="Buscar o crear (Enter)…"
          onkeydown={handleQueryKeydown}
          class="flex-1 rounded-xl border px-4 py-2 bg-transparent"
          style="border-color: var(--border);"
        />
        <input type="number" min="0.1" step="0.1" bind:value={qty}
          class="w-20 rounded-xl border px-3 py-2 bg-transparent"
          style="border-color: var(--border);" />
        <select bind:value={unit}
          class="rounded-xl border px-3 py-2 bg-transparent"
          style="border-color: var(--border);">
          {#each UNITS as u}<option value={u}>{u}</option>{/each}
        </select>
      </div>

      <!-- Filtro por categoría/sección de esta tienda -->
      <div class="flex flex-wrap gap-1.5">
        <button onclick={() => (activeCat = 'all')}
          class="rounded-full border px-3 py-1 text-xs transition"
          class:active-cat={activeCat === 'all'}
          style="border-color: var(--border);">
          Todas
        </button>
        {#each categories as c (c.id)}
          <button onclick={() => (activeCat = c.id)}
            class="rounded-full border px-3 py-1 text-xs transition"
            class:active-cat={activeCat === c.id}
            style="border-color: var(--border);">
            {c.icon.kind === 'emoji' ? c.icon.value : '📁'} {c.name}
          </button>
        {/each}
      </div>

      <!-- Sugerencias de productos según filtro -->
      {#if filtered.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each filtered as p (p.id)}
            <button onclick={() => addProduct(p.id)}
              class="rounded-full border px-3 py-1.5 text-sm hover:bg-[var(--accent)] hover:text-white transition"
              style="border-color: var(--border);">
              {p.icon.kind === 'emoji' ? p.icon.value : '🏷️'} {p.name}
            </button>
          {/each}
        </div>
      {:else if query.trim()}
        <p class="text-sm text-muted">
          Sin resultados. Pulsa <kbd class="rounded border px-1.5 py-0.5 text-xs"
            style="border-color: var(--border);">Enter</kbd> para crear "<strong>{query}</strong>".
        </p>
      {/if}
    </div>

    <!-- Lista agrupada -->
    {#if list.items.length === 0}
      <p class="text-center text-muted py-12">Lista vacía. Añade productos arriba ⬆️</p>
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
                <li class={`flex items-center gap-3 py-2.5 ${item.done ? 'product-done' : ''}`}>
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
                    <div class="flex items-center gap-1.5 mt-1">
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
                  <button onclick={() => app.removeItem(storeId, item.id)}
                    class="text-muted hover:text-red-500 text-2xl shrink-0" title="Quitar">×</button>
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
  .active-cat {
    background: var(--accent);
    color: white;
    border-color: var(--accent) !important;
  }
</style>
