<script lang="ts">
  import { app } from '$lib/stores/app.svelte';
  import StoreCard from './StoreCard.svelte';

  const visibleStores = $derived(
    app.state.stores
      .filter((s) => s.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {#each visibleStores as store (store.id)}
    <StoreCard {store} />
  {/each}
</div>
