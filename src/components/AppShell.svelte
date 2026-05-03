<script lang="ts">
  // Wrapper raíz: hidrata el store, decide si mostrar setup, gate de PIN o la app.
  // El estado "unlocked" se persiste en localStorage atado al username actual,
  // así no vuelve a pedir el PIN al navegar entre páginas o al recargar.

  import { onMount } from 'svelte';
  import { app } from '$lib/stores/app.svelte';
  import ProfileSetup from './auth/ProfileSetup.svelte';
  import PinGate from './auth/PinGate.svelte';
  import StoreGrid from './list/StoreGrid.svelte';
  import ThemeToggle from './ui/ThemeToggle.svelte';
  import BackupModal from './ui/BackupModal.svelte';
  import { startSync, stopSync, syncStatus } from '$lib/sync.svelte';

  const UNLOCK_KEY = 'tucompra:unlocked:v1';

  let unlocked = $state(false);
  let showBackup = $state(false);

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

  onMount(() => {
    app.hydrate();
    unlocked = readUnlock(app.state.profile?.username);
    applyTheme(app.state.profile?.theme ?? 'system');
    if (app.state.profile) startSync().catch(console.warn);
  });

  // Si el usuario crea/restaura un perfil más tarde, arranca sync entonces.
  $effect(() => {
    if (app.state.profile && !syncStatus.enabled) {
      startSync().catch(console.warn);
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

  function signOut() {
    // Sólo bloquea con PIN, NO desconecta sync (cuando vuelva a desbloquear
    // sigue al día). Si quieres romper la sesión por completo, usa "cambiar usuario".
    clearUnlock();
    unlocked = false;
  }

  function changeUser() {
    if (!confirm('¿Borrar este perfil del dispositivo? Genera primero un código de backup si quieres conservar las listas.')) return;
    stopSync();
    clearUnlock();
    app.signOut();
    unlocked = false;
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
          {#if syncStatus.enabled}
            <span title={syncStatus.peers > 0
              ? `Sincronizando con ${syncStatus.peers} dispositivo${syncStatus.peers === 1 ? '' : 's'}`
              : 'Sync activo, esperando otro dispositivo con el mismo usuario'}
              class="inline-flex items-center gap-1 text-xs">
              <span class="size-2 rounded-full"
                style={syncStatus.peers > 0
                  ? 'background:#22c55e; box-shadow: 0 0 6px #22c55e;'
                  : 'background:#94a3b8;'}></span>
              {syncStatus.peers > 0 ? `${syncStatus.peers}` : ''}
            </span>
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick={() => (showBackup = true)} title="Generar código de backup"
          class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">📋</button>
        <button onclick={signOut} title="Cerrar sesión (volverá a pedir el PIN)"
          class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">🔒</button>
        <button onclick={changeUser} title="Cambiar de usuario"
          class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">👤</button>
        <ThemeToggle />
      </div>
    </header>
    <StoreGrid />
  </main>

  {#if showBackup}
    <BackupModal onClose={() => (showBackup = false)} />
  {/if}
{/if}
