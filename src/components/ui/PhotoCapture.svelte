<script lang="ts">
  // Cámara dentro de la app para hacer una foto a un producto o tienda.
  //
  // No usamos <input capture> porque el WebView del companion de Android lo
  // IGNORA y manda todo a la galería. getUserMedia sí funciona ahí — es el mismo
  // mecanismo que el escáner de códigos, que ya va en Android.

  import { onDestroy } from 'svelte';
  import { t } from '$lib/i18n/ui.svelte';
  import { canvasToStorableDataUrl } from '$lib/image';

  let { onCapture, onClose }: {
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
  } = $props();

  let videoEl: HTMLVideoElement | null = $state(null);
  let stream: MediaStream | null = null;
  let error = $state('');
  let busy = $state(false);

  async function openCamera(): Promise<MediaStream> {
    const hi = { width: { ideal: 1920 }, height: { ideal: 1080 } };
    // Trasera si la hay; si el navegador solo da frontal, se acepta igual.
    for (const c of [
      { video: { facingMode: { ideal: 'environment' }, ...hi } },
      { video: hi },
      { video: true },
    ] as MediaStreamConstraints[]) {
      try { return await navigator.mediaDevices.getUserMedia(c); } catch { /* siguiente */ }
    }
    throw new Error('sin cámara');
  }

  async function start() {
    if (!videoEl) return;
    try {
      stream = await openCamera();
      videoEl.srcObject = stream;
      await videoEl.play();
    } catch {
      error = t('scan.errorCamera');
    }
  }

  function shoot() {
    if (!videoEl?.videoWidth || busy) return;
    busy = true;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { busy = false; error = t('product.imgError'); return; }
    // El vídeo va a lo ancho (object-cover) pero se captura el fotograma
    // completo; el recorte fino lo hace el usuario apuntando.
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    onCapture(canvasToStorableDataUrl(canvas));  // image.ts redimensiona y comprime
    stop();
    onClose();
  }

  function stop() {
    stream?.getTracks().forEach((tr) => tr.stop());
    stream = null;
  }

  $effect(() => { if (videoEl) start(); });
  onDestroy(stop);
</script>

<div class="fixed inset-0 z-[70] grid place-items-center p-4"
  style="background: rgba(0,0,0,.85)" onclick={onClose} role="presentation">
  <div class="w-full max-w-md space-y-3" onclick={(e) => e.stopPropagation()} role="presentation">
    <div class="relative">
      <video bind:this={videoEl} muted playsinline
        class="w-full rounded-xl bg-black aspect-[4/3] object-cover"></video>
    </div>

    {#if error}
      <p class="text-sm text-red-400 text-center">{error}</p>
    {/if}

    <div class="flex items-center justify-center gap-6">
      <button onclick={onClose}
        class="rounded-full border px-4 py-2 text-sm text-white"
        style="border-color: rgba(255,255,255,.4);">{t('scan.cancel')}</button>
      <button onclick={shoot} disabled={!!error || busy}
        class="size-16 rounded-full border-4 border-white bg-white/20 disabled:opacity-40 grid place-items-center text-2xl"
        title={t('product.takePhoto')}>📷</button>
    </div>
  </div>
</div>
