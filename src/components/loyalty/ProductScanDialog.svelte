<script lang="ts">
  import { t } from '$lib/i18n/ui.svelte';
  // Alta de producto escaneando su código de barras.
  //  1. Escanea el EAN con la cámara (BarcodeDetector nativo).
  //  2. Si `product_lookup` está activado, pregunta a la integración (que a su
  //     vez consulta Open Food Facts y cachea). Si no, se escribe el nombre.
  //  3. El usuario CONFIRMA nombre y sección antes de crear nada.

  import { app } from '$lib/stores/app.svelte';
  import { lookupBarcode, type LookupResult } from '$lib/sync.svelte';
  import type { Category } from '$lib/types';
  import BarcodeScanner from './BarcodeScanner.svelte';

  let { categories, defaultCategoryId, storeId, storeName, onAdd, onClose }: {
    categories: Category[];
    defaultCategoryId?: string;
    storeId: string;
    storeName: string;
    /** Añade el producto a la lista de la tienda actual (sin cerrar el diálogo). */
    onAdd: (productId: string) => void;
    onClose: () => void;
  } = $props();

  let feedback = $state('');

  // Exclusivo de esta tienda (marcas propias). Por defecto NO: la mayoría de los
  // códigos son de marcas nacionales que se venden en cualquier súper.
  let onlyHere = $state(false);

  type Step = 'scan' | 'form';
  let step = $state<Step>('scan');
  let barcode = $state('');
  let name = $state('');
  let categoryId = $state(defaultCategoryId ?? categories[0]?.id ?? '');
  let lookup = $state<LookupResult | null>(null);
  let busy = $state(false);

  /** Mapea las categorías de Open Food Facts a nuestras secciones. Es una
   *  aproximación por palabras clave: el usuario siempre puede cambiarla. */
  const OFF_HINTS: { needle: string; cat: string }[] = [
    { needle: 'dairy', cat: 'sup-lacteos' }, { needle: 'dairies', cat: 'sup-lacteos' },
    { needle: 'milk', cat: 'sup-lacteos' }, { needle: 'cheese', cat: 'sup-lacteos' },
    { needle: 'yogurt', cat: 'sup-lacteos' }, { needle: 'egg', cat: 'sup-lacteos' },
    { needle: 'beverage', cat: 'sup-bebidas' }, { needle: 'drink', cat: 'sup-bebidas' },
    { needle: 'water', cat: 'sup-bebidas' }, { needle: 'juice', cat: 'sup-bebidas' },
    { needle: 'beer', cat: 'sup-bebidas' }, { needle: 'wine', cat: 'sup-bebidas' },
    { needle: 'coffee', cat: 'sup-bebidas' }, { needle: 'tea', cat: 'sup-bebidas' },
    { needle: 'meat', cat: 'sup-carniceria' }, { needle: 'poultry', cat: 'sup-carniceria' },
    { needle: 'sausage', cat: 'sup-carniceria' },
    { needle: 'seafood', cat: 'sup-pescaderia' }, { needle: 'fish', cat: 'sup-pescaderia' },
    { needle: 'bread', cat: 'sup-panaderia' }, { needle: 'baker', cat: 'sup-panaderia' },
    { needle: 'pastri', cat: 'sup-panaderia' },
    { needle: 'charcuter', cat: 'sup-charcuteria' }, { needle: 'ham', cat: 'sup-charcuteria' },
    { needle: 'frozen', cat: 'sup-congelados' }, { needle: 'ice-cream', cat: 'sup-congelados' },
    { needle: 'snack', cat: 'sup-snacks' }, { needle: 'biscuit', cat: 'sup-snacks' },
    { needle: 'chocolate', cat: 'sup-snacks' }, { needle: 'candie', cat: 'sup-snacks' },
    { needle: 'crisp', cat: 'sup-snacks' },
    { needle: 'breakfast', cat: 'sup-desayuno' }, { needle: 'cereal', cat: 'sup-desayuno' },
    { needle: 'fruit', cat: 'sup-fruteria' }, { needle: 'vegetable', cat: 'sup-fruteria' },
    { needle: 'clean', cat: 'sup-limpieza' }, { needle: 'hygien', cat: 'sup-higiene' },
    { needle: 'baby', cat: 'sup-bebe' }, { needle: 'pet', cat: 'sup-mascotas' },
  ];

  function guessCategory(offTags: string[]): string | null {
    const avail = new Set(categories.map((c) => c.id));
    for (const tag of offTags) {
      const t = tag.toLowerCase();
      for (const { needle, cat } of OFF_HINTS) {
        if (t.includes(needle) && avail.has(cat)) return cat;
      }
    }
    return null;
  }

  let fbTimer: ReturnType<typeof setTimeout> | null = null;
  function flash(msg: string) {
    feedback = msg;
    if (fbTimer) clearTimeout(fbTimer);
    fbTimer = setTimeout(() => (feedback = ''), 2200);
  }

  async function onDetected(code: string) {
    // 1) ¿Ya conocemos este código? → directo a la lista, sin preguntar nada.
    //    Así re-escanear no duplica el catálogo ni la fila de la lista.
    const known = app.findByBarcode(code);
    if (known) {
      onAdd(known.id);
      flash(`✅ ${known.name}`);
      return; // modo continuo: seguimos escaneando
    }

    // 2) No existe → paramos y lo damos de alta con sus datos.
    barcode = code;
    step = 'form';
    busy = true;
    const res = await lookupBarcode(code);
    lookup = res;
    if (res.found && res.name) {
      // Nombre sugerido: producto + marca + cantidad, editable por el usuario.
      name = [res.name, res.brand, res.quantity].filter(Boolean).join(' ').trim();
      const guessed = guessCategory(res.categories ?? []);
      if (guessed) categoryId = guessed;
    }
    busy = false;
  }

  // Si Open Food Facts trajo foto (ya incrustada por HA como data URL), la
  // usamos como icono del producto en vez del 🏷️ genérico. Se guarda con el
  // producto, así que sigue viéndose sin conexión.
  const usePhoto = $derived(!!lookup?.image);

  /** Da de alta el producto en el catálogo (con su código) y lo mete en la lista.
   *  Volvemos a escanear: así se pueden encadenar varios en casa. */
  function create() {
    const clean = name.trim();
    if (clean.length < 2 || !categoryId) return;
    const p = app.createCustomProduct(clean, categoryId, {
      storeId: onlyHere ? storeId : undefined,
      icon: usePhoto ? { kind: 'image', value: lookup!.image! } : undefined,
      barcode,   // clave: la próxima vez se reconoce y no se duplica
    });
    onAdd(p.id);
    flash(`✅ ${p.name}`);
    // Reset para el siguiente.
    name = '';
    lookup = null;
    barcode = '';
    onlyHere = false;
    step = 'scan';
  }
</script>

{#if step === 'scan'}
  <BarcodeScanner onDetected={(code) => onDetected(code)} {onClose} continuous {feedback} />
{:else}
  <div class="fixed inset-0 z-[60] grid place-items-center p-4"
    style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
    <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()} role="presentation">

      <header class="flex items-start justify-between">
        <h2 class="text-lg font-bold">➕ {t('product.scannedTitle')}</h2>
        <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
      </header>

      <p class="text-xs text-muted font-mono">{barcode}</p>

      {#if busy}
        <p class="text-sm text-muted">{t('scan.searching')}</p>
      {:else if lookup && !lookup.enabled}
        <div class="rounded-xl bg-[var(--bg)] p-3 text-xs space-y-1"
          style="border: 1px solid var(--border);">
          <p>🔒 <strong>{t('product.lookupOffTitle')}</strong> {t('product.lookupOffNote')}</p>
          <p class="text-muted">{t('product.lookupOffBody', {
            code: 'product_lookup: true', parent: 'tucompra:', file: 'configuration.yaml',
          })}</p>
        </div>
      {:else if lookup && !lookup.found}
        <p class="text-xs text-muted">
          {lookup.error === 'network' ? t('scan.offline') : t('scan.notInOff')}
        </p>
      {:else if lookup?.found}
        <div class="flex items-center gap-3">
          {#if lookup.image}
            <img src={lookup.image} alt="" class="size-14 object-contain rounded-lg bg-white" />
          {/if}
          <p class="text-xs text-muted">
            Encontrado{lookup.cached ? ' (en caché)' : ''}. Revísalo antes de añadirlo.
            {#if usePhoto}<br />Se usará la foto como icono del producto.{/if}
          </p>
        </div>
      {/if}

      <label class="block">
        <span class="text-sm font-medium">{t('product.name')}</span>
        <input type="text" bind:value={name} placeholder={t('product.namePlaceholder')}
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

      <label class="flex items-start gap-2 rounded-xl border p-3 cursor-pointer"
        style="border-color: var(--border);">
        <input type="checkbox" bind:checked={onlyHere} class="mt-0.5" />
        <span class="text-xs">
          <strong>{t('product.onlyIn', { store: storeName })}</strong>
          <span class="block text-muted">{t('product.onlyInHint')}</span>
        </span>
      </label>

      <div class="flex gap-2 pt-1">
        <button onclick={() => (step = 'scan')}
          class="rounded-xl border px-4 py-2.5 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">📷 {t('product.another')}</button>
        <button onclick={create} disabled={name.trim().length < 2}
          class="flex-1 rounded-xl py-2.5 font-semibold text-white disabled:opacity-50 transition"
          style="background: var(--accent);">{t('product.add')}</button>
      </div>
    </div>
  </div>
{/if}
