<script lang="ts">
  // Icono de un producto: emoji, o la foto real (data URL) si el producto se dio
  // de alta escaneando y Open Food Facts trajo imagen.
  import type { Product } from '$lib/types';
  import { base } from '$lib/base';

  let { product, size = 'text-2xl', px = 28 }:
    { product?: Product; size?: string; px?: number } = $props();

  const isImage = $derived(product?.icon.kind === 'image' && !!product.icon.value);
  const src = $derived(
    isImage
      ? (product!.icon.value.startsWith('data:')
          ? product!.icon.value
          : base(product!.icon.value))
      : '',
  );
</script>

{#if isImage}
  <img {src} alt="" loading="lazy"
    class="object-contain rounded bg-white shrink-0"
    style="width:{px}px; height:{px}px;" />
{:else}
  <span class="{size} shrink-0">
    {product?.icon.kind === 'emoji' ? product.icon.value : '🏷️'}
  </span>
{/if}
