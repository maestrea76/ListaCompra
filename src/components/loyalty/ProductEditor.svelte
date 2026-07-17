<script lang="ts">
  import { t } from '$lib/i18n/ui.svelte';
  // Editor de producto. Dos modos según de dónde venga:
  //
  //  - Custom (escaneado o creado con Enter, id 'custom-*'): se edita todo y se
  //    puede borrar.
  //  - Del seed: solo la imagen. Nombre, categoría y unidad los rehace
  //    refreshSeed() en cada arranque, así que editarlos aquí sería mentir: se
  //    perderían al recargar. La imagen sí persiste porque va en la capa
  //    productIcons, aparte del producto.

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

  /** Los del seed se rehacen en cada arranque: de ellos solo la imagen es tuya. */
  const isCustom = $derived(product.id.startsWith('custom-'));

  let name = $state(product.name);
  let categoryId = $state(product.categoryId);
  let unit = $state<Unit>(product.defaultUnit);
  let onlyHere = $state(product.storeId === storeId);
  let emoji = $state(product.icon.kind === 'emoji' ? product.icon.value : '🏷️');
  // Imagen actual: la que haya puesto el usuario, o la que trajo Open Food Facts.
  let photo = $state(product.icon.kind === 'image' ? product.icon.value : '');
  let imgError = $state('');

  const inLists = $derived(app.countItemsOf(product.id));

  /** Sube una imagen y la deja como icono. Igual límite que el logo de tienda:
   *  se guarda como dataURL dentro del estado, que se sincroniza con HA. */
  async function handleImage(e: Event) {
    imgError = '';
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      imgError = t('store.errImageBig');
      return;
    }
    photo = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
  }

  /** Devuelve el producto a su icono original (emoji del seed o foto de OFF). */
  function resetIcon() {
    app.setProductIcon(product.id, null);
    const orig = app.state.products.find((p) => p.id === product.id);
    photo = orig?.icon.kind === 'image' ? orig.icon.value : '';
    emoji = orig?.icon.kind === 'emoji' ? orig.icon.value : '🏷️';
  }

  function save() {
    const icon = photo
      ? ({ kind: 'image', value: photo } as const)
      : ({ kind: 'emoji', value: emoji || '🏷️' } as const);

    // El icono va SIEMPRE a la capa de overrides, también en los custom: así
    // "volver al original" recupera la foto que trajo Open Food Facts en vez de
    // haberla machacado.
    app.setProductIcon(product.id, icon);

    if (isCustom) {
      const clean = name.trim();
      if (clean.length < 2) return;
      app.updateProduct({
        ...product,
        name: clean,
        categoryId,
        defaultUnit: unit,
        ...(onlyHere ? { storeId } : { storeId: undefined }),
      });
    }
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
  <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto [scrollbar-gutter:stable]"
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
      <div class="flex-1 space-y-1.5">
        {#if !photo}
          <label class="block">
            <span class="text-xs text-muted">{t('product.emoji')}</span>
            <input type="text" bind:value={emoji} maxlength="4"
              class="mt-1 w-20 rounded-lg border px-2 py-1 text-center text-xl bg-transparent"
              style="border-color: var(--border);" />
          </label>
        {/if}
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <!-- Cualquier producto puede llevar imagen propia, también los del
               seed y los escaneados (que ya traen la foto de Open Food Facts). -->
          <label class="text-xs cursor-pointer" style="color: var(--accent);">
            📷 {photo ? t('product.changeImage') : t('product.useImage')}
            <input type="file" accept="image/*" class="hidden" onchange={handleImage} />
          </label>
          {#if photo}
            <button type="button" onclick={() => (photo = '')}
              class="text-xs text-muted hover:underline">{t('product.removePhoto')}</button>
          {/if}
          {#if app.hasCustomIcon(product.id)}
            <button type="button" onclick={resetIcon}
              class="text-xs text-muted hover:underline">{t('product.resetIcon')}</button>
          {/if}
        </div>
        {#if imgError}<p class="text-xs text-red-500">{imgError}</p>{/if}
      </div>
    </div>

    {#if isCustom}
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
          <strong>{t('product.onlyIn', { store: storeName })}</strong>
          <span class="block text-muted">{t('product.onlyHereNote')}</span>
        </span>
      </label>
    {:else}
      <!-- Del seed: solo la imagen es editable. Se dice, en vez de enseñar
           campos que al recargar volverían a su valor original. -->
      <p class="text-xs text-muted rounded-xl bg-[var(--bg)] p-3"
        style="border: 1px solid var(--border);">
        {t('product.seedNote', { name: product.name })}
      </p>
    {/if}

    {#if product.barcode}
      <p class="text-[11px] text-muted">
        {t('product.barcodeLabel')} <span class="font-mono">{product.barcode}</span>
        — {t('product.barcodeNote')}
      </p>
    {/if}

    {#if inLists > 0}
      <p class="text-[11px] text-muted">{t('product.inListsNow', { n: inLists })}</p>
    {/if}

    <div class="flex gap-2 pt-1">
      <!-- Borrar solo los custom: uno del seed reaparecería en el siguiente
           arranque, así que el botón prometería algo que no ocurre. -->
      {#if isCustom}
        <button onclick={confirmDelete}
          class="rounded-xl border px-4 py-2.5 text-sm font-medium"
          style="border-color: #dc2626; color: #dc2626;">🗑️ {t('product.delete')}</button>
      {/if}
      <button onclick={save} disabled={isCustom && name.trim().length < 2}
        class="flex-1 rounded-xl py-2.5 font-semibold text-white disabled:opacity-50"
        style="background: var(--accent);">{t('product.save')}</button>
    </div>
  </div>
</div>
