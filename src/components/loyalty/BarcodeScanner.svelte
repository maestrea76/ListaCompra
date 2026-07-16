<script lang="ts">
  // Escáner de tarjetas con la cámara usando la API nativa BarcodeDetector.
  // Sin librerías: existe en Chrome/Edge (Android y escritorio). En Safari/iOS y
  // Firefox NO existe → avisamos y el usuario mete el número a mano.
  //
  // Requiere contexto seguro (HTTPS) y permiso de cámara; el iframe del panel ya
  // se registra con allow="camera".

  import { onDestroy } from 'svelte';
  import type { LoyaltyFormat } from '$lib/types';

  let { onDetected, onClose }:
    { onDetected: (code: string, format: LoyaltyFormat) => void; onClose: () => void } = $props();

  // Formato que devuelve BarcodeDetector → el nuestro.
  const FROM_NATIVE: Record<string, LoyaltyFormat> = {
    qr_code: 'qr', ean_13: 'ean13', ean_8: 'ean8',
    code_128: 'code128', code_39: 'code39', upc_a: 'upca',
  };

  const supported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  let videoEl: HTMLVideoElement | null = $state(null);
  let error = $state('');
  let stream: MediaStream | null = null;
  let raf = 0;
  let stopped = false;

  async function start() {
    if (!supported || !videoEl) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      videoEl.srcObject = stream;
      await videoEl.play();
      // @ts-expect-error — BarcodeDetector aún no está en los tipos del DOM.
      const detector = new window.BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a'],
      });
      const tick = async () => {
        if (stopped || !videoEl) return;
        try {
          const codes = await detector.detect(videoEl);
          if (codes.length > 0) {
            const hit = codes[0];
            const fmt = FROM_NATIVE[hit.format] ?? 'code128';
            stop();
            onDetected(String(hit.rawValue), fmt);
            return;
          }
        } catch {}
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch (e) {
      error = 'No se pudo abrir la cámara. Revisa los permisos del navegador.';
    }
  }

  function stop() {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  $effect(() => {
    if (videoEl && supported) start();
  });

  onDestroy(stop);

  function close() {
    stop();
    onClose();
  }
</script>

<div class="fixed inset-0 z-[60] grid place-items-center p-4"
  style="background: rgba(0,0,0,.8)" onclick={close} role="presentation">
  <div class="card-elev w-full max-w-md p-5 space-y-3 pop-in"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
      <h2 class="text-lg font-bold">📷 Escanear tarjeta</h2>
      <button onclick={close} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    {#if !supported}
      <div class="rounded-xl bg-[var(--bg)] p-3 text-sm space-y-1.5"
        style="border: 1px solid var(--border);">
        <p>⚠️ <strong>Este navegador no puede escanear.</strong></p>
        <p class="text-muted">La lectura de códigos con la cámara solo está
          disponible en Chrome/Edge (Android y escritorio). En iPhone/Safari y
          Firefox no existe todavía.</p>
        <p class="text-muted">Cierra esta ventana y <strong>escribe el número</strong>
          de la tarjeta a mano: suele venir impreso junto al código.</p>
      </div>
    {:else}
      <video bind:this={videoEl} muted playsinline
        class="w-full rounded-xl bg-black aspect-[4/3] object-cover"></video>
      <p class="text-xs text-muted">
        Enfoca el código de la tarjeta. Se detecta solo y se cierra al leerlo.
      </p>
    {/if}

    {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

    <button onclick={close}
      class="w-full rounded-xl border py-2.5 font-medium hover:bg-[var(--bg)] transition"
      style="border-color: var(--border);">Cancelar</button>
  </div>
</div>
