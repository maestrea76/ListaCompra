<script lang="ts">
  import type { Store } from '$lib/types';
  import { app } from '$lib/stores/app.svelte';
  import { base } from '$lib/base';

  let { store }: { store: Store } = $props();

  const list = $derived(app.state.lists[store.id]);
  const pending = $derived(list ? list.items.filter((i) => !i.done).length : 0);
  const total = $derived(list?.items.length ?? 0);

  // Color de fondo del marco/badge: usa brand.bg como base; si es blanco
  // mantiene un borde sutil para que no desaparezca en tema claro.
  const badgeStyle = $derived(
    store.brand
      ? `background:${store.brand.bg};color:${store.brand.fg};`
      : 'background:var(--bg-elev);color:var(--fg);',
  );

  const isImage = $derived(store.icon.kind === 'image');
  const imgSrc = $derived(isImage ? base(store.icon.value) : '');
</script>

<a
  href={base(`/lista/${store.id}`)}
  class="card-elev p-3 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.99] transition aspect-square relative overflow-hidden"
>
  <!-- Tarjeta tipo logo: fondo con color corporativo + imagen / iniciales / emoji -->
  <div
    class="size-20 rounded-2xl grid place-items-center font-extrabold shadow-sm overflow-hidden"
    style={badgeStyle}
  >
    {#if isImage}
      <img src={imgSrc} alt={store.name}
        class="max-h-16 max-w-[72px] object-contain" />
    {:else if store.brand?.initials}
      <span class="text-2xl tracking-tight leading-none">{store.brand.initials}</span>
    {:else if store.icon.kind === 'emoji'}
      <span class="text-4xl">{store.icon.value}</span>
    {:else}
      <span class="text-4xl">🏪</span>
    {/if}
  </div>

  <div class="text-center w-full">
    <div class="font-semibold text-sm leading-tight truncate">{store.name}</div>
    {#if total > 0}
      <div class="text-xs text-muted mt-0.5">{pending} pend / {total}</div>
    {/if}
  </div>

  {#if pending > 0}
    <span class="absolute top-2 right-2 size-5 rounded-full text-[10px] font-bold grid place-items-center"
      style="background: var(--accent); color: white;">
      {pending}
    </span>
  {/if}
</a>
