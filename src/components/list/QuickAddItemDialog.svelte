<script lang="ts">
  import { app } from '$lib/stores/app.svelte';
  import { t } from '$lib/i18n/ui.svelte';
  import { localeLanguageTag } from '$lib/i18n/locale';
  import { norm, rankMatches } from '$lib/search';
  import type { Product } from '$lib/types';
  import ProductIcon from '../ui/ProductIcon.svelte';

  let { initialStoreId, onClose }: { initialStoreId?: string; onClose: () => void } = $props();

  const collator = $derived(
    new Intl.Collator(localeLanguageTag(app.state.locale), { sensitivity: 'base' }),
  );
  const stores = $derived(
    app.state.stores
      .filter((store) => store.enabled !== false)
      .slice()
      .sort((a, b) => collator.compare(a.name, b.name)),
  );

  let storeId = $state(
    app.state.stores.some((store) => store.id === initialStoreId && store.enabled !== false)
      ? initialStoreId!
      : app.state.stores.find((store) => store.enabled !== false)?.id ?? '',
  );
  let query = $state('');

  const store = $derived(stores.find((candidate) => candidate.id === storeId));
  const categories = $derived(
    store ? app.state.categories.filter((category) => category.typeId === store.typeId) : [],
  );
  const categoryIds = $derived(new Set(categories.map((category) => category.id)));
  const categoryNames = $derived(new Map(categories.map((category) => [category.id, category.name])));
  const products = $derived(
    store
      ? app.state.products.filter(
          (product) => categoryIds.has(product.categoryId)
            && (!product.storeId || product.storeId === store.id),
        )
      : [],
  );

  const matches = $derived.by(() => {
    if (query.trim()) return rankMatches(products, query).slice(0, 12);
    return products
      .map((product) => ({ product, count: app.usageCount(storeId, product.id) }))
      .sort((a, b) => b.count - a.count || collator.compare(a.product.name, b.product.name))
      .slice(0, 12)
      .map(({ product }) => product);
  });

  function addProduct(product: Product) {
    if (!store) return;
    app.addItem(store.id, { productId: product.id, qty: 1, unit: product.defaultUnit });
    onClose();
  }

  function createAndAdd() {
    const name = query.trim();
    if (!name || !store) return;
    const exact = products.find((product) => norm(product.name) === norm(name));
    if (exact) return addProduct(exact);
    if (matches.length > 0) return addProduct(matches[0]);
    addProduct(app.createFreeProduct(name, store.typeId));
  }
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onClose()} />

<div class="fixed inset-0 z-[60] grid place-items-center p-4" style="background: rgba(0,0,0,.5)"
  onclick={onClose} role="presentation">
  <section class="card-elev w-full max-w-lg p-5 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
    onclick={(event) => event.stopPropagation()} role="dialog" aria-modal="true"
    aria-labelledby="quick-add-title">
    <header class="flex items-center justify-between gap-3">
      <h2 id="quick-add-title" class="text-lg font-bold">➕ {t('all.quickAddTitle')}</h2>
      <button type="button" onclick={onClose} title={t('list.cancelLower')}
        class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    {#if stores.length === 0}
      <p class="text-sm text-muted">{t('all.noStores')}</p>
    {:else}
      <label class="block space-y-1">
        <span class="text-sm font-medium">{t('all.chooseStore')}</span>
        <select bind:value={storeId} onchange={() => (query = '')}
          class="w-full rounded-lg border px-3 py-2.5 bg-transparent" style="border-color: var(--border);">
          {#each stores as candidate (candidate.id)}
            <option value={candidate.id}>{candidate.name}</option>
          {/each}
        </select>
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-medium">{t('all.productSearch')}</span>
        <input type="text" bind:value={query}
          onkeydown={(event) => event.key === 'Enter' && createAndAdd()}
          placeholder={t('list.search')} autofocus
          class="w-full rounded-lg border px-3 py-2.5 bg-transparent" style="border-color: var(--border);" />
      </label>

      {#if matches.length > 0}
        <ul class="divide-y" style="border-color: var(--border);">
          {#each matches as product (product.id)}
            <li>
              <button type="button" onclick={() => addProduct(product)}
                class="w-full min-h-12 py-2 flex items-center gap-3 text-start hover:bg-[var(--bg)] transition">
                <ProductIcon {product} size="text-xl" px={28} />
                <span class="min-w-0">
                  <span class="block font-medium truncate">{product.name}</span>
                  <span class="block text-xs text-muted truncate">{categoryNames.get(product.categoryId)}</span>
                </span>
              </button>
            </li>
          {/each}
        </ul>
      {:else if query.trim()}
        <button type="button" onclick={createAndAdd}
          class="w-full rounded-lg border p-3 text-start hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">
          {t('all.createProduct', { q: query.trim() })}
        </button>
      {/if}
    {/if}
  </section>
</div>
