<script lang="ts">
  // Modal de creación/edición de tienda. En modo creación genera un id
  // basado en slug del nombre.

  import { app } from '$lib/stores/app.svelte';
  import type { Store, IconRef, LoyaltyFormat } from '$lib/types';
  import BarcodeScanner from '../loyalty/BarcodeScanner.svelte';
  import LoyaltyCode from '../loyalty/LoyaltyCode.svelte';

  let { store, onClose }: { store?: Store; onClose: () => void } = $props();

  const isEdit = $derived(!!store);

  // Tarjeta de fidelización (se guarda en la tienda → se sincroniza con la lista).
  let loyaltyCode = $state(store?.loyalty?.code ?? '');
  let loyaltyFormat = $state<LoyaltyFormat>(store?.loyalty?.format ?? 'qr');
  let showScanner = $state(false);

  const FORMATS: { id: LoyaltyFormat; label: string }[] = [
    { id: 'qr', label: 'QR' },
    { id: 'ean13', label: 'EAN-13' },
    { id: 'ean8', label: 'EAN-8' },
    { id: 'code128', label: 'Code 128' },
    { id: 'code39', label: 'Code 39' },
    { id: 'upca', label: 'UPC-A' },
  ];

  function onScanned(code: string, format: LoyaltyFormat) {
    loyaltyCode = code;
    loyaltyFormat = format;
    showScanner = false;
  }

  let name = $state(store?.name ?? '');
  let typeId = $state(store?.typeId ?? 'supermercado');
  let iconKind = $state<IconRef['kind']>(store?.icon.kind ?? 'emoji');
  let iconEmoji = $state(store?.icon.kind === 'emoji' ? store.icon.value : '🛒');
  let iconImage = $state(store?.icon.kind === 'image' ? store.icon.value : '');
  let bg = $state(store?.brand?.bg ?? '#2aa063');
  let fg = $state(store?.brand?.fg ?? '#FFFFFF');
  let initials = $state(store?.brand?.initials ?? '');
  let error = $state('');

  function slug(s: string) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'tienda';
  }

  async function handleImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      error = 'Imagen demasiado grande (máx. 200 KB).';
      return;
    }
    iconImage = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
    iconKind = 'image';
  }

  function buildIcon(): IconRef {
    if (iconKind === 'image' && iconImage) return { kind: 'image', value: iconImage };
    return { kind: 'emoji', value: iconEmoji || '🛒' };
  }

  function save() {
    error = '';
    const cleanName = name.trim();
    if (cleanName.length < 2) { error = 'Nombre demasiado corto.'; return; }

    const finalStore: Store = {
      id: store?.id ?? `${slug(cleanName)}-${Date.now().toString(36)}`,
      name: cleanName,
      typeId,
      icon: buildIcon(),
      brand: { bg, fg, initials: initials.trim() || undefined },
      order: store?.order ?? app.state.stores.length,
      enabled: true,
      edited: true,    // marca para que refreshSeed no la sobreescriba
      loyalty: loyaltyCode.trim()
        ? { code: loyaltyCode.trim(), format: loyaltyFormat }
        : undefined,
    };
    app.upsertStore(finalStore);
    onClose();
  }

  function confirmDelete() {
    if (!store) return;
    if (!confirm(
      `¿Borrar la tienda "${store.name}" y su lista de la compra?\n\n` +
      'Esta acción no se puede deshacer.'
    )) return;
    app.removeStore(store.id);
    onClose();
  }
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4"
  style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
  <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
        <h2 class="text-lg font-bold">{isEdit ? '✏️ Editar tienda' : '➕ Nueva tienda'}</h2>
        <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
      </header>

      <!-- Preview -->
      <div class="flex items-center gap-3">
        <div class="size-16 rounded-2xl grid place-items-center font-extrabold shadow-sm overflow-hidden"
          style="background:{bg};color:{fg};">
          {#if iconKind === 'image' && iconImage}
            <img src={iconImage} alt="" class="max-h-12 max-w-[56px] object-contain" />
          {:else if initials}
            <span class="text-xl">{initials}</span>
          {:else}
            <span class="text-3xl">{iconEmoji}</span>
          {/if}
        </div>
        <div class="text-sm">
          <div class="font-semibold">{name || 'Sin nombre'}</div>
          <div class="text-xs text-muted">Vista previa</div>
        </div>
      </div>

      <label class="block">
        <span class="text-sm font-medium">Nombre</span>
        <input type="text" bind:value={name} placeholder="p.ej. Eroski Centro"
          class="mt-1 w-full rounded-xl border px-4 py-2 bg-transparent"
          style="border-color: var(--border);" />
      </label>

      <label class="block">
        <span class="text-sm font-medium">Tipo de establecimiento</span>
        <select bind:value={typeId}
          class="mt-1 w-full rounded-xl border px-4 py-2 bg-transparent"
          style="border-color: var(--border);">
          {#each app.state.storeTypes as t}
            <option value={t.id}>
              {t.icon.kind === 'emoji' ? t.icon.value : ''} {t.name}
            </option>
          {/each}
        </select>
      </label>

      <fieldset class="rounded-xl border p-3 space-y-2" style="border-color: var(--border);">
        <legend class="text-sm font-medium px-2">Logotipo</legend>
        <div class="flex gap-2 text-xs">
          <button type="button" onclick={() => (iconKind = 'emoji')}
            class="flex-1 rounded-lg border py-1.5"
            style={iconKind === 'emoji'
              ? 'background: var(--accent); color: white; border-color: var(--accent);'
              : 'border-color: var(--border);'}>Emoji</button>
          <button type="button" onclick={() => (iconKind = 'image')}
            class="flex-1 rounded-lg border py-1.5"
            style={iconKind === 'image'
              ? 'background: var(--accent); color: white; border-color: var(--accent);'
              : 'border-color: var(--border);'}>Imagen</button>
        </div>

        {#if iconKind === 'emoji'}
          <input type="text" bind:value={iconEmoji} maxlength="4"
            class="w-full rounded-lg border px-3 py-2 text-center text-2xl bg-transparent"
            style="border-color: var(--border);" />
        {:else}
          <input type="file" accept="image/*" onchange={handleImage}
            class="block w-full text-xs" />
          {#if iconImage}
            <p class="text-[10px] text-muted">Imagen cargada ({Math.round(iconImage.length / 1024)} KB en base64)</p>
          {/if}
        {/if}
      </fieldset>

      <fieldset class="rounded-xl border p-3 space-y-2" style="border-color: var(--border);">
        <legend class="text-sm font-medium px-2">Colores de marca</legend>
        <div class="grid grid-cols-3 gap-2 items-center text-xs">
          <label class="flex items-center gap-1">
            <input type="color" bind:value={bg} class="size-8 rounded cursor-pointer" />
            Fondo
          </label>
          <label class="flex items-center gap-1">
            <input type="color" bind:value={fg} class="size-8 rounded cursor-pointer" />
            Texto
          </label>
          <input type="text" bind:value={initials} maxlength="3" placeholder="Inic."
            class="rounded-lg border px-2 py-1 text-center bg-transparent"
            style="border-color: var(--border);" />
        </div>
      </fieldset>

      <fieldset class="rounded-xl border p-3 space-y-2" style="border-color: var(--border);">
        <legend class="text-sm font-medium px-2">🎟️ Tarjeta de fidelización</legend>

        <div class="flex gap-2">
          <input type="text" bind:value={loyaltyCode} placeholder="Número o código de la tarjeta"
            class="flex-1 rounded-lg border px-3 py-2 text-sm bg-transparent"
            style="border-color: var(--border);" />
          <button type="button" onclick={() => (showScanner = true)}
            title="Escanear con la cámara"
            class="rounded-lg border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
            style="border-color: var(--border);">📷</button>
        </div>

        <div class="flex items-center gap-2">
          <select bind:value={loyaltyFormat}
            class="flex-1 rounded-lg border px-2 py-1.5 text-xs bg-transparent"
            style="border-color: var(--border);">
            {#each FORMATS as f}<option value={f.id}>{f.label}</option>{/each}
          </select>
          {#if loyaltyCode.trim()}
            <button type="button" onclick={() => (loyaltyCode = '')}
              class="text-xs text-muted hover:underline">quitar</button>
          {/if}
        </div>

        {#if loyaltyCode.trim()}
          <div class="flex justify-center pt-1">
            <LoyaltyCode card={{ code: loyaltyCode.trim(), format: loyaltyFormat }} />
          </div>
        {/if}

        <p class="text-[10px] text-muted">
          Se guarda en esta tienda: si la lista es compartida, la verán sus miembros.
          Entra en los backups de Home Assistant.
        </p>
      </fieldset>

      {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

      <div class="flex gap-2 pt-2">
        {#if isEdit}
          <button onclick={confirmDelete}
            class="rounded-xl border px-4 py-2.5 text-sm font-medium"
            style="border-color: #dc2626; color: #dc2626;">🗑️ Borrar</button>
        {/if}
        <button onclick={save}
          class="flex-1 rounded-xl py-2.5 font-semibold text-white"
          style="background: var(--accent);">
          {isEdit ? 'Guardar cambios' : 'Crear tienda'}
        </button>
      </div>
  </div>
</div>

{#if showScanner}
  <BarcodeScanner onDetected={onScanned} onClose={() => (showScanner = false)} />
{/if}
