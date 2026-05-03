<script lang="ts">
  // Wrapper raíz: hidrata el store, decide si mostrar setup, gate de PIN o la app.
  // El estado "unlocked" se persiste en localStorage atado al username actual,
  // así no vuelve a pedir el PIN al navegar entre páginas o al recargar.
  //
  // La sync es OPT-IN: el usuario la activa desde el panel 📡. Al cargar
  // la app, sólo se arranca automáticamente si el usuario la activó antes.

  import { onMount } from 'svelte';
  import { app } from '$lib/stores/app.svelte';
  import { clearState } from '$lib/storage';
  import ProfileSetup from './auth/ProfileSetup.svelte';
  import PinGate from './auth/PinGate.svelte';
  import StoreGrid from './list/StoreGrid.svelte';
  import ThemeToggle from './ui/ThemeToggle.svelte';
  import BackupModal from './ui/BackupModal.svelte';
  import SyncDiag from './ui/SyncDiag.svelte';
  import { startSync, stopSync, syncStatus, syncWasEnabled, hydrateAuth } from '$lib/sync.svelte';

  const UNLOCK_KEY = 'tucompra:unlocked:v1';

  let unlocked = $state(false);
  let showBackup = $state(false);
  let showDiag = $state(false);

  function readUnlock(username?: string): boolean {
    if (!username || typeof localStorage === 'undefined') return false;
    return localStorage.getItem(UNLOCK_KEY) === username;
  }

  function writeUnlock(username: string) {
    localStorage.setItem(UNLOCK_KEY, username);
  }

  function clearUnlock() {
    localStorage.removeItem(UNLOCK_KEY);
  }

  onMount(async () => {
    app.hydrate();
    unlocked = readUnlock(app.state.profile?.username);
    applyTheme(app.state.profile?.theme ?? 'system');

    // Hidrata sesión Supabase si la había de antes.
    await hydrateAuth();

    // Si la sync estaba activa antes y tenemos auth + passphrase en
    // sessionStorage, la re-arrancamos.
    if (syncWasEnabled() && syncStatus.user && syncStatus.passphraseSet) {
      startSync().catch((e) => console.warn('Sync auto-start falló:', e));
    }
  });

  function applyTheme(t: 'light' | 'dark' | 'system') {
    const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  $effect(() => {
    if (app.state.profile?.theme) applyTheme(app.state.profile.theme);
  });

  function handleUnlock() {
    if (app.state.profile) writeUnlock(app.state.profile.username);
    unlocked = true;
  }

  /** Cierra sesión = borra TODO del navegador.
   *  El backup queda en quien lo haya guardado (código copiado / sync activa). */
  function signOut() {
    if (!confirm(
      '¿Cerrar sesión y borrar tus datos de este navegador?\n\n' +
      'Se eliminan listas, productos personalizados y tiendas custom.\n' +
      'Si tenías sync activa o un código de backup, podrás restaurar.\n\n' +
      'Esta acción no se puede deshacer en este dispositivo.'
    )) return;
    try { stopSync(); } catch {}
    clearUnlock();
    clearState();
    location.reload();
  }
</script>

{#if !app.hydrated}
  <div class="min-h-screen grid place-items-center text-muted">Cargando…</div>
{:else if !app.state.profile}
  <ProfileSetup />
{:else if !unlocked}
  <PinGate onUnlock={handleUnlock} />
{:else}
  <main class="mx-auto max-w-5xl px-4 py-6">
    <header class="flex items-center justify-between mb-6 gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold">🛒 Tu Compra</h1>
        <p class="text-sm text-muted truncate flex items-center gap-1.5">
          Hola, {app.state.profile.username}
          <button onclick={() => (showDiag = true)}
            title="Ver estado de sincronización"
            class="inline-flex items-center gap-1 text-xs rounded-full border px-1.5 py-0.5 hover:bg-[var(--bg)] transition"
            style="border-color: var(--border);">
            <span class="size-2 rounded-full"
              style={syncStatus.peers > 0
                ? 'background:#22c55e; box-shadow: 0 0 6px #22c55e;'
                : syncStatus.signalingConnected
                  ? 'background:#0ea5e9;'
                  : syncStatus.lastError
                    ? 'background:#ef4444;'
                    : syncStatus.enabled
                      ? 'background:#0ea5e9;'
                      : 'background:#94a3b8;'}></span>
            {syncStatus.peers > 0 ? `${syncStatus.peers}` : 'sync'}
          </button>
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick={() => (showBackup = true)} title="Generar código de backup"
          class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">📋</button>
        <button onclick={signOut} title="Cerrar sesión y borrar datos del navegador"
          class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">🚪</button>
        <ThemeToggle />
      </div>
    </header>
    <StoreGrid />
  </main>

  {#if showBackup}
    <BackupModal onClose={() => (showBackup = false)} />
  {/if}

  {#if showDiag}
    <SyncDiag onClose={() => (showDiag = false)} />
  {/if}
{/if}
