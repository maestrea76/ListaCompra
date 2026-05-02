<script lang="ts">
  import type { Store } from '$lib/types';
  import { app } from '$lib/stores/app.svelte';
  import { base } from '$lib/base';

  let { store }: { store: Store } = $props();

  const list = $derived(app.state.lists[store.id]);
  const pending = $derived(list ? list.items.filter((i) => !i.done).length : 0);
  const total = $derived(list?.items.length ?? 0);
</script>

<a
  href={base(`/lista/${store.id}`)}
  class="card-elev p-4 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99] transition aspect-square"
>
  <div class="text-4xl">
    {#if store.icon.kind === 'emoji'}
      {store.icon.value}
    {:else if store.icon.kind === 'image'}
      <img src={store.icon.value} alt="" class="size-12 object-contain" />
    {:else}
      🏪
    {/if}
  </div>
  <div class="text-center">
    <div class="font-semibold text-sm leading-tight">{store.name}</div>
    {#if total > 0}
      <div class="text-xs text-muted mt-1">
        {pending} pendiente{pending === 1 ? '' : 's'} / {total}
      </div>
    {/if}
  </div>
</a>
