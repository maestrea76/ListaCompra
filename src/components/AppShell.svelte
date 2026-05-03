<script lang="ts">
  // Wrapper raíz: hidrata el store y decide si mostrar el setup inicial o
  // la app. Sin PIN — la autenticación real (cuando el usuario activa la
  // sync online) la gestiona Supabase con email+password.

  import { onMount } from 'svelte';
  import { app } from '$lib/stores/app.svelte';
  import { clearState } from '$lib/storage';
  import ProfileSetup from './auth/ProfileSetup.svelte';
  import StoreGrid from './list/StoreGrid.svelte';
  import ThemeToggle from './ui/ThemeToggle.svelte';
  import SyncDiag from './ui/SyncDiag.svelte';
  import { startSync, stopSync, syncStatus, syncWasEnabled, hydrateAuth } from '$lib/sync.svelte';

  let showDiag = $state(false);

  onMount(async () => {
    app.hydrate();
    applyTheme(app.state.profile?.theme ?? 'system');

    // Hidrata sesión Supabase si la había de antes.
    await hydrateAuth();

    // Si la sync estaba activa antes y tenemos auth + passphrase
    // persistida, la re-arrancamos transparentemente.
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

  /** Cierra sesión = borra TODO del navegador.
   *  Si tenías sync online activa, los datos siguen en Supabase y puedes
   *  recuperarlos al volver a iniciar sesión con el mismo email + passphrase. */
  function signOut() {
    if (!confirm(
      '¿Cerrar sesión y borrar tus datos de este navegador?\n\n' +
      'Se eliminan listas, productos personalizados y tiendas custom.\n' +
      'Si tenías sync online activa, los datos siguen en la nube — vuelves\n' +
      'a entrar con tu email + passphrase y los recuperas.\n\n' +
      'Esta acción no se puede deshacer en este dispositivo.'
    )) return;
    try { stopSync(); } catch {}
    clearState();
    location.reload();
  }
</script>

{#if !app.hydrated}
  <div class="min-h-screen grid place-items-center text-muted">Cargando…</div>
{:else if !app.state.profile}
  <ProfileSetup />
{:else}
  <main class="mx-auto max-w-5xl px-4 py-6">
    <header class="flex items-center justify-between mb-6 gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold">🛒 Tu Compra</h1>
        <p class="text-sm text-muted truncate">Hola, {app.state.profile.username}</p>
        <button onclick={() => (showDiag = true)}
          title="Ver estado de sincronización"
          class="mt-1 inline-flex items-center gap-1 text-xs rounded-full border px-2 py-1 hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">
          <span class="size-2 rounded-full"
            style={syncStatus.enabled && syncStatus.signalingConnected
              ? 'background:#22c55e; box-shadow: 0 0 6px #22c55e;'
              : syncStatus.enabled
                ? 'background:#0ea5e9;'
                : syncStatus.lastError
                  ? 'background:#ef4444;'
                  : 'background:#94a3b8;'}></span>
          {syncStatus.enabled && syncStatus.signalingConnected
            ? 'sync'
            : syncStatus.enabled
              ? 'sync…'
              : 'sync off'}
        </button>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button onclick={signOut} title="Cerrar sesión y borrar datos del navegador"
          class="rounded-full border px-3 py-2 text-sm hover:bg-[var(--bg)] transition"
          style="border-color: var(--border);">🚪</button>
        <ThemeToggle />
      </div>
    </header>
    <StoreGrid />
  </main>

  {#if showDiag}
    <SyncDiag onClose={() => (showDiag = false)} />
  {/if}
{/if}
