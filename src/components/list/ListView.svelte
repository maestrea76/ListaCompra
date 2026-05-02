<script lang="ts">
  // Vista de la lista de una tienda concreta. Agrupa items por categoría
  // y permite añadir/marcar/borrar productos.

  import { onMount } from 'svelte';
  import { app } from '$lib/stores/app.svelte';
  import { base } from '$lib/base';
  import type { Unit } from '$lib/types';

  let { storeId }: { storeId: string } = $props();

  let query = $state('');
  let qty = $state(1);
  let unit = $state<Unit>('unidad');

  onMount(() => app.hydrate());

  const store = $derived(app.state.stores.find((s) => s.id === storeId));
  const list = $derived(app.state.lists[storeId] ?? { storeId, items: [], updatedAt: 0 });

  const productsForType = $derived.by(() => {
    if (!store) return [];
    const cats = app.state.categories.filter((c) => c.typeId === store.typeId);
    const catIds = new Set(cats.map((c) => c.id));
    return app.state.products.filter((p) => catIds.has(p.categoryId));
  });

  const filtered = $derived(
    query.trim().length === 0
      ? productsForType.slice(0, 30)
      : productsForType.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 30),
  );

  // Agrupado por categoría para la lista actual
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

  function productName(id: string) {
    return app.state.products.find((p) => p.id === id)?.name ?? '?';
  }

  function productIcon(id: string) {
    const p = app.state.products.find((x) => x.id === id);
    return p?.icon.kind === 'emoji' ? p.icon.value : '🏷️';
  }
</script>

{#if !store}
  <p>Tienda no encontrada.</p>
{:else}
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <a href={base('/')} class="text-sm text-muted hover:underline">← Tiendas</a>
      <h2 class="text-xl font-bold flex items-center gap-2">
        <span>{store.icon.kind === 'emoji' ? store.icon.value : '🏪'}</span>
        {store.name}
      </h2>
      <button onclick={() => app.clearDone(storeId)} class="text-xs text-muted hover:underline">
        Limpiar comprados
      </button>
    </header>

    <!-- Buscador / añadir -->
    <div class="card-elev p-4 space-y-3">
      <div class="flex gap-2">
        <input
          type="text" bind:value={query} placeholder="Buscar producto…"
          class="flex-1 rounded-xl border px-4 py-2 bg-transparent"
          style="border-color: var(--border);"
        />
        <input type="number" min="0.1" step="0.1" bind:value={qty}
          class="w-20 rounded-xl border px-3 py-2 bg-transparent"
          style="border-color: var(--border);" />
        <select bind:value={unit}
          class="rounded-xl border px-3 py-2 bg-transparent"
          style="border-color: var(--border);">
          <option value="unidad">ud</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="l">l</option>
          <option value="ml">ml</option>
          <option value="paquete">paq</option>
          <option value="docena">doc</option>
        </select>
      </div>

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
      {:else}
        <p class="text-sm text-muted">Sin resultados. Pulsa Enter para añadir como producto libre.</p>
      {/if}
    </div>

    <!-- Lista agrupada -->
    {#if list.items.length === 0}
      <p class="text-center text-muted py-12">Lista vacía. Añade productos arriba ⬆️</p>
    {:else}
      <div class="space-y-4">
        {#each grouped as group (group.category?.id ?? 'x')}
          <section class="card-elev p-4">
            <h3 class="font-semibold mb-2 flex items-center gap-2">
              <span>{group.category?.icon.kind === 'emoji' ? group.category.icon.value : '📁'}</span>
              {group.category?.name ?? 'Sin categoría'}
            </h3>
            <ul class="divide-y" style="--tw-divide-opacity:1; border-color: var(--border);">
              {#each group.items as item (item.id)}
                <li class={`flex items-center gap-3 py-2 ${item.done ? 'product-done' : ''}`}>
                  <button onclick={() => app.toggleItem(storeId, item.id)}
                    class="size-8 rounded-full border-2 grid place-items-center transition"
                    style={item.done
                      ? 'background: var(--accent); border-color: var(--accent); color: white;'
                      : 'border-color: var(--border);'}>
                    {item.done ? '✓' : ''}
                  </button>
                  <span class="text-2xl">{productIcon(item.productId)}</span>
                  <div class="flex-1">
                    <div class="product-name font-medium">{productName(item.productId)}</div>
                    <div class="text-xs text-muted">{item.qty} {item.unit}</div>
                  </div>
                  <button onclick={() => app.removeItem(storeId, item.id)}
                    class="text-muted hover:text-red-500 text-lg" title="Quitar">×</button>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    {/if}
  </div>
{/if}
