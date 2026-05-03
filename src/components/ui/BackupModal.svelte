<script lang="ts">
  // Modal para generar el código de backup. El usuario lo copia y lo pega
  // en otro dispositivo (en el modo "Restaurar" del Setup) para mover sus
  // datos sin servidores.

  import { generateBackupCode, downloadBackupCode } from '$lib/backup';

  let { onClose }: { onClose: () => void } = $props();

  let code = $state('');
  let loading = $state(true);
  let copied = $state(false);

  $effect(() => {
    generateBackupCode()
      .then((c) => (code = c))
      .catch((e) => (code = `Error: ${(e as Error).message}`))
      .finally(() => (loading = false));
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      // fallback: seleccionar para copia manual
      const ta = document.querySelector<HTMLTextAreaElement>('#backup-code');
      ta?.select();
    }
  }
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4"
  style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
  <div class="card-elev w-full max-w-lg p-6 space-y-4 pop-in"
    onclick={(e) => e.stopPropagation()} role="presentation">
    <header class="flex items-start justify-between">
      <div>
        <h2 class="text-lg font-bold">📋 Código de backup</h2>
        <p class="text-xs text-muted mt-1">
          Cópialo y pégalo en otro dispositivo en "Restaurar" para mover tus
          listas y productos. Sin servidores.
        </p>
      </div>
      <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    {#if loading}
      <p class="text-center text-muted py-6">Generando…</p>
    {:else}
      <textarea
        id="backup-code"
        readonly
        rows="6"
        class="w-full rounded-xl border p-3 text-xs font-mono break-all bg-transparent"
        style="border-color: var(--border);"
        value={code}
      ></textarea>

      <p class="text-xs text-muted">{code.length} caracteres</p>

      <div class="flex gap-2">
        <button onclick={copy}
          class="flex-1 rounded-xl py-2.5 font-semibold text-white transition"
          style="background: var(--accent);">
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
        <button onclick={downloadBackupCode}
          class="rounded-xl border px-4 py-2.5 font-medium hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">
          💾 Guardar .txt
        </button>
      </div>
    {/if}
  </div>
</div>
