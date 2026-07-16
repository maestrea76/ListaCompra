<script lang="ts">
  // Lista los productos que ha creado el usuario (escaneados o con Enter) que
  // están disponibles en esta tienda, para editarlos o borrarlos.
  // Los del catálogo de fábrica no salen: no son editables (refreshSeed los
  // restauraría en cada arranque).

  import { app } from '$lib/stores/app.svelte';
  import type { Category, Product } from '$lib/types';
  import ProductIcon from '../ui/ProductIcon.svelte';
  import ProductEditor from './ProductEditor.svelte';

  let { categories, storeId, storeName, onClose }: {
    categories: Category[];
    storeId: string;
    storeName: string;
    onClose: () => void;
  } = $props();

  let editing = $state<Product | null>(null);
  let query = $state('');

  const catName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? 'Sin sección';

  const mine = $derived.by(() => {
    const catIds = new Set(categories.map((c) => c.id));
    const q = query.trim().toLowerCase();
    return app.state.products
      .filter((p) => p.id.startsWith('custom-'))
      .filter((p) => catIds.has(p.categoryId) && (!p.storeId || p.storeId === storeId))
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  });
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4"
  style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
  <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
      <h2 class="text-lg font-bold">🏷️ Mis productos</h2>
      <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    <p class="text-xs text-muted">
      Los que has escaneado o creado tú y están disponibles en {storeName}. El
      catálogo de fábrica no se puede editar.
    </p>

    {#if mine.length === 0 && !query}
      <p class="text-sm text-muted py-6 text-center">
        Todavía no has creado ninguno aquí.<br />
        Escanea uno con 📷 o escribe su nombre y pulsa Enter.
      </p>
    {:else}
      <input type="text" bind:value={query} placeholder="Filtrar…"
        class="w-full rounded-xl border px-4 py-2 text-sm bg-transparent"
        style="border-color: var(--border);" />

      {#if mine.length === 0}
        <p class="text-sm text-muted py-4 text-center">Ninguno coincide con "{query}".</p>
      {:else}
        <ul class="divide-y" style="border-color: var(--border);">
          {#each mine as p (p.id)}
            <li class="flex items-center gap-3 py-2.5">
              <ProductIcon product={p} px={28} />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">{p.name}</div>
                <div class="text-[11px] text-muted truncate">
                  {catName(p.categoryId)}
                  {#if p.storeId === storeId} · solo aquí{/if}
                </div>
              </div>
              <button onclick={() => (editing = p)}
                class="text-muted hover:text-current text-lg shrink-0"
                title="Editar">✏️</button>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
</div>

{#if editing}
  <ProductEditor product={editing} {categories} {storeId} {storeName}
    onClose={() => (editing = null)} />
{/if}
