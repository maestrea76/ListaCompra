<script lang="ts">
  import { t } from '$lib/i18n/ui.svelte';
  // Edita o borra un producto del catálogo creado por el usuario (escaneado o
  // creado con Enter). Los del seed no se tocan: refreshSeed los restauraría.

  import { app } from '$lib/stores/app.svelte';
  import type { Category, Product, Unit } from '$lib/types';
  import ProductIcon from '../ui/ProductIcon.svelte';

  let { product, categories, storeId, storeName, onClose }: {
    product: Product;
    categories: Category[];
    storeId: string;
    storeName: string;
    onClose: () => void;
  } = $props();

  const UNITS: Unit[] = ['unidad', 'kg', 'g', 'l', 'ml', 'paquete', 'docena', 'caja'];

  let name = $state(product.name);
  let categoryId = $state(product.categoryId);
  let unit = $state<Unit>(product.defaultUnit);
  let onlyHere = $state(product.storeId === storeId);
  let emoji = $state(product.icon.kind === 'emoji' ? product.icon.value : '🏷️');
  // Foto original (si vino de Open Food Facts). Se puede quitar para volver a emoji.
  let photo = $state(product.icon.kind === 'image' ? product.icon.value : '');

  const inLists = $derived(app.countItemsOf(product.id));

  function save() {
    const clean = name.trim();
    if (clean.length < 2) return;
    app.updateProduct({
      ...product,
      name: clean,
      categoryId,
      defaultUnit: unit,
      icon: photo ? { kind: 'image', value: photo } : { kind: 'emoji', value: emoji || '🏷️' },
      ...(onlyHere ? { storeId } : { storeId: undefined }),
    });
    onClose();
  }

  function confirmDelete() {
    const extra = inLists > 0 ? `\n\n${t('product.inLists', { n: inLists })}` : '';
    if (!confirm(t('product.confirmDeleteFull', { name: product.name, extra }))) return;
    app.removeProduct(product.id);
    onClose();
  }
</script>

<div class="fixed inset-0 z-[60] grid place-items-center p-4"
  style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
  <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
      <h2 class="text-lg font-bold">✏️ {t('product.editTitle')}</h2>
      <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    <!-- Icono -->
    <div class="flex items-center gap-3">
      <div class="size-14 grid place-items-center rounded-xl border" style="border-color: var(--border);">
        <ProductIcon product={{ ...product, icon: photo ? { kind: 'image', value: photo } : { kind: 'emoji', value: emoji } }} px={40} />
      </div>
      <div class="flex-1 space-y-1">
        {#if photo}
          <p class="text-xs text-muted">{t('product.photoNote')}</p>
          <button type="button" onclick={() => (photo = '')}
            class="text-xs text-muted hover:underline">{t('product.removePhoto')}</button>
        {:else}
          <label class="block">
            <span class="text-xs text-muted">{t('product.emoji')}</span>
            <input type="text" bind:value={emoji} maxlength="4"
              class="mt-1 w-20 rounded-lg border px-2 py-1 text-center text-xl bg-transparent"
              style="border-color: var(--border);" />
          </label>
        {/if}
      </div>
    </div>

    <label class="block">
      <span class="text-sm font-medium">{t('product.name')}</span>
      <input type="text" bind:value={name}
        class="mt-1 w-full rounded-xl border px-4 py-2 bg-transparent"
        style="border-color: var(--border);" />
    </label>

    <label class="block">
      <span class="text-sm font-medium">{t('product.section')}</span>
      <select bind:value={categoryId}
        class="mt-1 w-full rounded-xl border px-4 py-2 bg-transparent"
        style="border-color: var(--border);">
        {#each categories as c (c.id)}
          <option value={c.id}>{c.icon.kind === 'emoji' ? c.icon.value : '📁'} {c.name}</option>
        {/each}
      </select>
    </label>

    <label class="block">
      <span class="text-sm font-medium">{t('product.defaultUnit')}</span>
      <select bind:value={unit}
        class="mt-1 w-full rounded-xl border px-4 py-2 bg-transparent"
        style="border-color: var(--border);">
        {#each UNITS as u}<option value={u}>{u}</option>{/each}
      </select>
    </label>

    <label class="flex items-start gap-2 rounded-xl border p-3 cursor-pointer"
      style="border-color: var(--border);">
      <input type="checkbox" bind:checked={onlyHere} class="mt-0.5" />
      <span class="text-xs">
        <strong>Solo en {storeName}</strong>
        <span class="block text-muted">Para marcas propias. Si lo desmarcas,
          aparecerá en todas las tiendas de este tipo.</span>
      </span>
    </label>

    {#if product.barcode}
      <p class="text-[11px] text-muted">
        {t('product.barcodeLabel')} <span class="font-mono">{product.barcode}</span>
        — {t('product.barcodeNote')}
      </p>
    {/if}

    {#if inLists > 0}
      <p class="text-[11px] text-muted">En {inLists} lista(s) ahora mismo.</p>
    {/if}

    <div class="flex gap-2 pt-1">
      <button onclick={confirmDelete}
        class="rounded-xl border px-4 py-2.5 text-sm font-medium"
        style="border-color: #dc2626; color: #dc2626;">🗑️ {t('product.delete')}</button>
      <button onclick={save} disabled={name.trim().length < 2}
        class="flex-1 rounded-xl py-2.5 font-semibold text-white disabled:opacity-50"
        style="background: var(--accent);">{t('product.save')}</button>
    </div>
  </div>
</div>
