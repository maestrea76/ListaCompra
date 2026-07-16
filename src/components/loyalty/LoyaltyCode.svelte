<script lang="ts">
  import { t } from '$lib/i18n/ui.svelte';
  // Dibuja el código de una tarjeta de fidelización: QR (qrcode-generator) o
  // código de barras 1D (JsBarcode). No hay API nativa del navegador para
  // *generar* códigos, solo para leerlos, de ahí estas dos librerías (pequeñas).
  //
  // Siempre sobre fondo blanco y con buen contraste: los lectores de caja lo
  // necesitan.

  import qrcode from 'qrcode-generator';
  import JsBarcode from 'jsbarcode';
  import type { LoyaltyCard } from '$lib/types';

  let { card, big = false }: { card: LoyaltyCard; big?: boolean } = $props();

  // Nombres de formato que entiende JsBarcode.
  const BARCODE_FORMAT: Record<string, string> = {
    ean13: 'EAN13', ean8: 'EAN8', code128: 'CODE128', code39: 'CODE39', upca: 'UPC',
  };

  let svgEl: SVGSVGElement | null = $state(null);
  let error = $state('');

  // QR: generamos el SVG como string y lo inyectamos.
  const qrSvg = $derived.by(() => {
    if (card.format !== 'qr' || !card.code) return '';
    try {
      const qr = qrcode(0, 'M');
      qr.addData(card.code);
      qr.make();
      return qr.createSvgTag({ cellSize: big ? 8 : 4, margin: 2, scalable: true });
    } catch {
      return '';
    }
  });

  // Barras 1D: JsBarcode pinta sobre el <svg> ya montado.
  $effect(() => {
    if (card.format === 'qr' || !svgEl || !card.code) return;
    error = '';
    try {
      JsBarcode(svgEl, card.code, {
        format: BARCODE_FORMAT[card.format] ?? 'CODE128',
        displayValue: true,
        width: big ? 3 : 2,
        height: big ? 120 : 60,
        margin: 8,
        background: '#FFFFFF',
        lineColor: '#000000',
      });
    } catch (e) {
      // Típico: el código no cumple el formato (p. ej. EAN13 exige 12-13 dígitos).
      error = `El código no es válido para el formato ${card.format.toUpperCase()}.`;
    }
  });
</script>

{#if card.format === 'qr'}
  {#if qrSvg}
    <div class="qr bg-white p-3 rounded-xl inline-block" style="line-height:0;">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html qrSvg}
    </div>
  {:else}
    <p class="text-sm text-red-500">{t('loyalty.qrError')}</p>
  {/if}
{:else}
  <div class="bg-white p-3 rounded-xl inline-block">
    <svg bind:this={svgEl}></svg>
  </div>
  {#if error}<p class="text-sm text-red-500 mt-2">{error}</p>{/if}
{/if}

<style>
  /* El SVG del QR viene sin tamaño; lo ajustamos al contenedor. */
  .qr :global(svg) { width: 100%; height: auto; display: block; }
</style>
