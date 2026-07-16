<script lang="ts">
  // Escáner de códigos con la API nativa BarcodeDetector (sin librerías).
  // Existe en Chrome/Edge (Android y escritorio); en Safari/iOS y Firefox no.
  //
  // La tasa de acierto depende sobre todo de la IMAGEN que le damos al detector:
  //  - Resolución: por defecto getUserMedia da ~640x480 y las barras finas de un
  //    EAN se pierden. Pedimos 1920x1080 ideal.
  //  - Enfoque: sin autofocus continuo el código sale borroso de cerca.
  //  - Luz: linterna si el dispositivo la expone.
  //  - Estabilidad: exigimos leer el MISMO valor dos veces seguidas antes de
  //    darlo por bueno, para no colar una lectura dudosa.

  import { onDestroy } from 'svelte';
  import type { LoyaltyFormat } from '$lib/types';

  let { onDetected, onClose, continuous = false, feedback = '' }: {
    onDetected: (code: string, format: LoyaltyFormat) => void;
    onClose: () => void;
    /** Si es true, no se cierra al leer: sigue escaneando (para encadenar
     *  productos en casa). El mismo código no se repite durante unos segundos. */
    continuous?: boolean;
    /** Mensaje que muestra el padre tras cada lectura ("✅ X añadido"). */
    feedback?: string;
  } = $props();

  const FROM_NATIVE: Record<string, LoyaltyFormat> = {
    qr_code: 'qr', ean_13: 'ean13', ean_8: 'ean8',
    code_128: 'code128', code_39: 'code39', upc_a: 'upca',
  };

  // Chrome/Edge traen BarcodeDetector nativo. Safari/iOS y Firefox no, así que
  // ahí cargamos un decodificador WASM (barcode-detector) SOLO en ese caso:
  // el import es dinámico, los navegadores con soporte nativo no lo descargan.
  const hasNative = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const FORMATS = ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a'];

  async function makeDetector(): Promise<any> {
    if (hasNative) {
      // @ts-expect-error — BarcodeDetector aún no está en los tipos del DOM.
      return new window.BarcodeDetector({ formats: FORMATS });
    }
    const [{ BarcodeDetector, setZXingModuleOverrides }, wasm] = await Promise.all([
      import('barcode-detector/pure'),
      // El .wasm se empaqueta con el panel y lo sirve TU Home Assistant. Por
      // defecto zxing-wasm lo pediría a un CDN: eso rompería el "sin peticiones
      // externas" y no funcionaría sin conexión.
      // Ojo: hay que usar el subpath EXPORTADO ('reader/…'), no la ruta interna
      // del paquete ('dist/reader/…'), o el bundler no lo resuelve.
      import('zxing-wasm/reader/zxing_reader.wasm?url'),
    ]);
    const wasmUrl = (wasm as { default: string }).default;
    setZXingModuleOverrides({
      locateFile: (path: string, prefix: string) =>
        path.endsWith('.wasm') ? wasmUrl : prefix + path,
    });
    return new BarcodeDetector({ formats: FORMATS as any });
  }

  let videoEl: HTMLVideoElement | null = $state(null);
  let error = $state('');
  let torchOn = $state(false);
  let torchAvailable = $state(false);
  let scanning = $state(false);

  let stream: MediaStream | null = null;
  let track: MediaStreamTrack | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;
  // Última lectura pendiente de confirmar (anti-falsos positivos).
  let lastSeen = '';
  // En modo continuo: evita re-leer el mismo código una y otra vez.
  let lastAccepted = '';
  let lastAcceptedAt = 0;
  const COOLDOWN_MS = 2500;

  async function start() {
    if (!videoEl) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          // Clave para leer códigos: cuanta más resolución, más definición en
          // las barras finas.
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      videoEl.srcObject = stream;
      await videoEl.play();

      track = stream.getVideoTracks()[0] ?? null;
      // Autofocus continuo y linterna, si el dispositivo los expone.
      if (track) {
        const caps = (track.getCapabilities?.() ?? {}) as Record<string, unknown>;
        torchAvailable = 'torch' in caps;
        if (Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
          try {
            // @ts-expect-error — focusMode no está en los tipos estándar.
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
          } catch {}
        }
      }

      const detector = await makeDetector();

      scanning = true;
      const tick = async () => {
        if (stopped || !videoEl) return;
        try {
          const codes = await detector.detect(videoEl);
          const hit = codes[0];
          if (hit?.rawValue) {
            const value = String(hit.rawValue);
            const now = Date.now();
            const onCooldown = value === lastAccepted && now - lastAcceptedAt < COOLDOWN_MS;
            if (onCooldown) {
              // Mismo producto todavía delante de la cámara: no repetir.
            } else if (value === lastSeen) {
              // Segunda lectura idéntica → la damos por buena.
              lastAccepted = value;
              lastAcceptedAt = now;
              lastSeen = '';
              onDetected(value, FROM_NATIVE[hit.format] ?? 'code128');
              if (!continuous) {
                stop();
                return;
              }
            } else {
              lastSeen = value;
            }
          }
        } catch {}
        // ~8 lecturas/seg: suficiente y deja respirar al decodificador con
        // fotogramas grandes.
        timer = setTimeout(tick, 120);
      };
      tick();
    } catch (e) {
      error = 'No se pudo abrir la cámara. Revisa los permisos del navegador.';
    }
  }

  async function toggleTorch() {
    if (!track) return;
    try {
      torchOn = !torchOn;
      // @ts-expect-error — torch no está en los tipos estándar.
      await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    } catch {
      torchOn = false;
      torchAvailable = false;
    }
  }

  function stop() {
    stopped = true;
    scanning = false;
    if (timer) clearTimeout(timer);
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    track = null;
  }

  $effect(() => {
    if (videoEl) start();
  });

  onDestroy(stop);

  function close() {
    stop();
    onClose();
  }
</script>

<div class="fixed inset-0 z-[60] grid place-items-center p-4"
  style="background: rgba(0,0,0,.85)" onclick={close} role="presentation">
  <div class="card-elev w-full max-w-lg p-5 space-y-3 pop-in"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
      <h2 class="text-lg font-bold">📷 Escanear código</h2>
      <button onclick={close} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    <div class="relative">
      <video bind:this={videoEl} muted playsinline
        class="w-full rounded-xl bg-black aspect-[4/3] object-cover"></video>
        <!-- Guía de encuadre: ayuda a acercar y centrar el código. -->
        <div class="pointer-events-none absolute inset-0 grid place-items-center">
          <div class="w-4/5 h-1/3 rounded-lg"
            style="border: 2px solid rgba(255,255,255,.9); box-shadow: 0 0 0 9999px rgba(0,0,0,.35);"></div>
        </div>
        {#if torchAvailable}
          <button onclick={toggleTorch}
            class="absolute bottom-2 right-2 rounded-full px-3 py-1.5 text-sm"
            style="background: rgba(0,0,0,.6); color: white;">
            {torchOn ? '🔦 Apagar' : '🔦 Linterna'}
          </button>
        {/if}
        {#if feedback}
          <div class="absolute top-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-sm font-medium"
            style="background: rgba(34,197,94,.95); color: white;">{feedback}</div>
        {/if}
      </div>
    <p class="text-xs text-muted text-center">
      Encuadra el código dentro del recuadro y <strong>acércate</strong> hasta
      que ocupe casi todo el ancho. Se lee solo.
      {#if continuous}<br />Puedes encadenar varios productos seguidos.{/if}
    </p>

    {#if error}<p class="text-sm text-red-500">{error}</p>{/if}

    <button onclick={close}
      class="w-full rounded-xl border py-2.5 font-medium hover:bg-[var(--bg)] transition"
      style="border-color: var(--border);">Cancelar</button>
  </div>
</div>
