<script lang="ts">
  // Botón que solo actúa si se MANTIENE pulsado, con un anillo que se rellena
  // para que se vea que hay que esperar (si no, parece que no responde).
  //
  // Existe porque las filas de la lista tienen los botones muy juntos: un toque
  // accidental abriendo el editor es molesto. Mantener no se pulsa sin querer.

  let { onHold, title = '', ms = 550, children }: {
    onHold: () => void;
    title?: string;
    /** Cuánto hay que mantener. Por debajo de ~400ms vuelve a ser accidental;
     *  por encima de ~800ms el usuario suelta creyendo que no va. */
    ms?: number;
    children: import('svelte').Snippet;
  } = $props();

  let progress = $state(0);          // 0..1
  let raf = 0;
  let t0 = 0;
  let done = false;

  function tick() {
    const p = Math.min(1, (performance.now() - t0) / ms);
    progress = p;
    if (p >= 1) {
      done = true;
      progress = 0;
      // Vibración corta al completar: confirma sin mirar. Solo existe en
      // Android; en iOS no hay API y se ignora.
      try { navigator.vibrate?.(25); } catch {}
      onHold();
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function begin(e: PointerEvent) {
    // Evita que Android abra su menú de selección al mantener.
    e.preventDefault();
    done = false;
    t0 = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function cancel() {
    cancelAnimationFrame(raf);
    progress = 0;
  }

  const R = 15;
  const C = 2 * Math.PI * R;
</script>

<button
  {title}
  onpointerdown={begin}
  onpointerup={cancel}
  onpointercancel={cancel}
  onpointerleave={cancel}
  oncontextmenu={(e) => e.preventDefault()}
  class="relative grid place-items-center size-9 shrink-0 rounded-full text-muted hover:text-current select-none"
  style="touch-action: none; -webkit-touch-callout: none;">

  {#if progress > 0}
    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r={R} fill="none" stroke="var(--border)" stroke-width="2.5" />
      <circle cx="18" cy="18" r={R} fill="none"
        stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round"
        stroke-dasharray={C} stroke-dashoffset={C * (1 - progress)}
        transform="rotate(-90 18 18)" />
    </svg>
  {/if}
  <span class="relative leading-none">{@render children()}</span>
</button>
