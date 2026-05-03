<script lang="ts">
  // Modal de diagnóstico de sincronización: muestra estado, sala (truncada),
  // log en vivo y botón de reconectar. Sirve para depurar cuándo no parece
  // que la sync funcione.

  import { syncStatus, reconnect, startSync, stopSync } from '$lib/sync.svelte';

  let { onClose }: { onClose: () => void } = $props();

  const ago = $derived(
    syncStatus.lastSyncAt
      ? `${Math.round((Date.now() - syncStatus.lastSyncAt) / 1000)}s`
      : '—',
  );
</script>

<div class="fixed inset-0 z-50 grid place-items-center p-4"
  style="background: rgba(0,0,0,.5)" onclick={onClose} role="presentation">
  <div class="card-elev w-full max-w-md p-6 space-y-4 pop-in max-h-[90vh] overflow-y-auto"
    onclick={(e) => e.stopPropagation()} role="presentation">

    <header class="flex items-start justify-between">
      <h2 class="text-lg font-bold">📡 Sincronización</h2>
      <button onclick={onClose} class="text-2xl leading-none text-muted hover:text-current">×</button>
    </header>

    <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      <dt class="text-muted">Estado</dt>
      <dd class="font-medium">
        {#if !syncStatus.enabled}
          <span style="color:#f59e0b">⚠️ no activa</span>
        {:else if syncStatus.peers > 0}
          <span style="color:#22c55e">🟢 conectado a {syncStatus.peers} dispositivo{syncStatus.peers === 1 ? '' : 's'}</span>
        {:else if syncStatus.signalingConnected}
          <span style="color:#0ea5e9">🟡 esperando otro dispositivo</span>
        {:else}
          <span style="color:#ef4444">🔴 sin signaling</span>
        {/if}
      </dd>

      <dt class="text-muted">Sala</dt>
      <dd class="font-mono text-xs break-all">{syncStatus.room || '—'}</dd>

      <dt class="text-muted">Última sync</dt>
      <dd>{ago === '—' ? '—' : `hace ${ago}`}</dd>

      {#if syncStatus.lastError}
        <dt class="text-muted">Error</dt>
        <dd class="text-red-500 text-xs break-all">{syncStatus.lastError}</dd>
      {/if}
    </dl>

    <details class="rounded-xl border p-3" style="border-color: var(--border);">
      <summary class="cursor-pointer text-sm font-medium">Log de eventos ({syncStatus.log.length})</summary>
      <pre class="mt-2 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-tight"
        style="color: var(--fg-muted)">{syncStatus.log.join('\n') || 'Sin eventos aún…'}</pre>
    </details>

    <div class="rounded-xl bg-[var(--bg)] p-3 text-xs space-y-1.5"
      style="border: 1px solid var(--border);">
      <p class="font-semibold">Para que funcione:</p>
      <ul class="list-disc pl-4 space-y-0.5 text-muted">
        <li>Abre la app en otro equipo o pestaña.</li>
        <li>Crea perfil con <strong>el mismo username</strong> (el PIN puede ser distinto).</li>
        <li>Espera 2-5 s a que se descubran. El indicador debe pasar a verde con un número.</li>
        <li>Si va a 🔴 (sin signaling), tu red bloquea WebRTC (firewall, VPN restrictiva).</li>
      </ul>
    </div>

    <div class="flex gap-2">
      {#if !syncStatus.enabled}
        <button onclick={() => startSync().catch(console.warn)}
          class="flex-1 rounded-xl py-2.5 font-semibold text-white transition"
          style="background: var(--accent);">
          ▶️ Activar sync
        </button>
      {:else}
        <button onclick={reconnect}
          class="flex-1 rounded-xl py-2.5 font-semibold text-white transition"
          style="background: var(--accent);">
          🔄 Reconectar
        </button>
        <button onclick={stopSync}
          class="rounded-xl border px-4 py-2.5 font-medium hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">
          ⏸️ Parar
        </button>
      {/if}
    </div>
  </div>
</div>
