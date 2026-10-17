<script lang="ts">
  import { app } from '$lib/stores/app.svelte';
  import { t } from '$lib/i18n/ui.svelte';

  // Solo listas de tiendas que siguen en el catálogo: al cambiar de idioma
  // las listas del locale anterior se conservan, pero ya no se muestran.
  const pending = $derived(
    Object.values(app.state.lists).reduce((n, list) => {
      if (!app.state.stores.some((store) => store.id === list.storeId)) return n;
      return n + list.items.filter((item) => !item.done).length;
    }, 0),
  );
</script>

<a href="#/all" title={t('all.openCount', { n: pending })}
  class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition inline-flex items-center gap-1"
  style="border-color: var(--border);">
  <span aria-hidden="true">📋</span>
  {#if pending > 0}<span class="tabular-nums">{pending}</span>{/if}
</a>
