<script lang="ts">
  import { app } from '$lib/stores/app.svelte';
  import StoreCard from './StoreCard.svelte';
  import StoreEditor from './StoreEditor.svelte';
  import type { Store } from '$lib/types';

  let editing = $state<Store | undefined>(undefined);
  let creating = $state(false);

  // Orden alfabético, pero la tienda "Otros" siempre al final.
  const visibleStores = $derived(
    app.state.stores
      .filter((s) => s.enabled !== false)
      .sort((a, b) => {
        const aOtros = /^otros$/i.test(a.name.trim());
        const bOtros = /^otros$/i.test(b.name.trim());
        if (aOtros !== bOtros) return aOtros ? 1 : -1;
        return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      }),
  );

  function openCreate() {
    editing = undefined;
    creating = true;
  }

  function openEdit(s: Store) {
    creating = false;
    editing = s;
  }

  function closeEditor() {
    editing = undefined;
    creating = false;
  }
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-24">
  {#each visibleStores as store (store.id)}
    <StoreCard {store} onEdit={openEdit} />
  {/each}
</div>

<!-- FAB para añadir tienda — flotante abajo-derecha. Estilo big-pill como
     en los dashboards tipo tesladash: sombra fuerte, color de marca, gran
     tamaño en mobile para acceso con el pulgar. -->
<button
  type="button"
  onclick={openCreate}
  title="Añadir tienda"
  class="fixed bottom-6 right-6 z-40 h-14 px-5 rounded-full font-bold text-white text-base flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition"
  style="background: var(--accent); box-shadow: 0 12px 28px -6px var(--accent);"
>
  <span class="text-2xl leading-none">+</span>
  <span class="hidden sm:inline">Nueva tienda</span>
</button>

{#if creating || editing}
  <StoreEditor store={editing} onClose={closeEditor} />
{/if}
