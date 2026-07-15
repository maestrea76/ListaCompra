<script lang="ts">
  // Botón "hamburguesa" (tres rayas) que despliega la barra lateral de Home
  // Assistant. Solo se muestra dentro del panel de HA (en la demo web no aplica).
  import { syncStatus, toggleHaSidebar } from '$lib/sync.svelte';
</script>

{#if syncStatus.inHA}
  <button onclick={toggleHaSidebar} type="button"
    title="Menú de Home Assistant" aria-label="Abrir menú lateral"
    class="shrink-0 size-9 rounded-full border grid place-items-center hover:bg-[var(--bg)] transition"
    style="border-color: var(--border);">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  </button>
{/if}
